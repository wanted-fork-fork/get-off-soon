# API 에러 핸들링 설계 (429 재시도 + 전역 오류 안내)

날짜: 2026-06-25

## 배경 / 문제

- 화면 3곳(`app/index.tsx`, `app/getting-off-status.tsx`, `app/seat-seekers.tsx`)이 각각 30초마다 폴링하고, 진입 시 여러 엔드포인트를 동시에 호출한다. 서버 rate limit(429)이 발생하기 쉬운 구조다.
- 현재 `apiFetch`에는 **429 처리·재시도 로직이 없다**. 401만 토큰 갱신 후 재시도한다.
- 에러는 호출부마다 `if (err instanceof ApiError) return;`로 **조용히 삼켜진다**. 사용자 동작 실패는 일부 `Alert.alert(...)`로 안내하지만 라벨이 제각각이고 일관된 전역 안내 수단이 없다.

## 목표

1. **429 발생 시 자동 재시도(백오프)** — `Retry-After` 우선, 없으면 지수 백오프. 소진 시 안내.
2. **API 에러에 대한 일관된 사용자 안내** — 신규 토스트(스낵바) UI로 노출.

## 비목표 (YAGNI)

- 기존 `Alert.alert(...)` 사용 액션을 토스트로 이관하지 않는다. (사용자 결정: 유지)
- 폴링/백그라운드 에러를 안내하지 않는다. (사용자 결정: 조용히)
- 오프라인 큐잉·요청 재생(replay), 전역 retry 정책 커스터마이즈 UI 등은 범위 밖.

## 핵심 제약 (반드시 준수)

- **`src/api/client.ts`와 `src/api/generated.ts`는 둘 다 `scripts/generate-api.mjs`가 생성한다.**
  - `client.ts` ← `generateClientCode()` (생성기 내 템플릿 문자열)
  - `generated.ts` ← `generateCode()` (래퍼 함수들)
  - 따라서 `apiFetch`/래퍼 변경은 **생성기 템플릿을 수정**하고 재생성해야 한다. 두 파일을 직접 편집하면 다음 재생성 때 사라진다.
- 신규 파일(`errorBus.ts`, `errorMessages.ts`, `Toast.tsx`)은 생성기가 건드리지 않으므로 일반 파일로 관리한다.
- 스타일 규칙: 컴포넌트에 `fontFamily`를 직접 쓰지 않는다. `fontWeight`만 사용.

## 안내 정책 — "기본 안내, 명시적 침묵(opt-out)"

`apiFetch`는 에러 발생 시 기본적으로 errorBus로 발행하고, ToastProvider가 토스트를 띄운다. 예외는 호출부에서 `silent: true`로 끈다.

| 호출 종류 | 동작 | 비고 |
|---|---|---|
| 기본 (사용자 동작 등) | errorBus 발행 → 토스트 노출 | "모든 에러 안내"의 기본값 |
| 폴링 3곳 | `{ silent: true }` → 토스트 없음 | 백그라운드 스팸 방지 |
| 기존 `Alert.alert` 액션 ~10곳 | `{ silent: true }` → 토스트 없음 | Alert 유지, 중복 안내 방지 |
| 401 | 항상 제외 | 토큰 갱신으로 조용히 처리 |

- 설계 의도: "놓친 `silent` 플래그"의 실패 모드가 *추가 토스트*(= 목표인 '에러 안내'에 부합)라 안전한 방향이다. 정확히 침묵시켜야 할 자리(폴링·Alert)만 관리하면 된다.
- **429 재시도·백오프와 네트워크 에러 정규화는 `silent` 여부와 무관하게 항상 동작한다.** `silent`는 *안내 노출* 여부만 제어한다.

## 아키텍처 (레이어)

`apiFetch`는 UI를 모르는 순수 모듈로 유지한다. 에러는 errorBus로 발행하고, UI 레이어(ToastProvider)가 구독한다.

```
호출부 ── apiFetch ──(에러)──> errorBus.emit ──> ToastProvider(구독) ──> Toast UI
              │
              └─ 429 재시도/백오프, 네트워크 에러 정규화 (silent 무관)
```

### 1. `src/api/client.ts` (생성기 `generateClientCode()` 수정)

`FetchOptions`에 `silent?: boolean` 추가:

```ts
type FetchOptions = {
  method: string;
  body?: unknown;
  auth?: boolean;
  silent?: boolean; // true면 에러를 errorBus로 발행하지 않음
};
```

`apiFetch` 동작 순서:

1. 요청 전송 (기존과 동일, 헤더 구성).
2. **401 처리**: 기존 토큰 갱신 후 재시도 로직 유지.
3. **429 처리 (신규)**:
   - 응답이 429면 `Retry-After` 헤더를 파싱한다. 초(정수) 또는 HTTP-date 모두 지원, 없으면 지수 백오프.
   - 백오프 스케줄: 0.5s → 1s → 2s (지터 ±20% 권장). 최대 **3회** 재시도.
   - `Retry-After`가 비정상적으로 크면 상한(예: 10s)으로 클램프.
   - 매 시도 전 대기 후 동일 요청 재전송.
4. **네트워크 에러 정규화 (신규)**: `fetch` 자체가 throw(연결 단절)하면 `ApiError('NETWORK', <메시지>, 0)`로 변환.
5. 재시도 소진 또는 그 외 비정상 응답이면 `ApiError` 생성. 429 소진은 `ApiError('RATE_LIMITED', ..., 429)`.
6. `!options.silent && statusCode !== 401`이면 `errorBus.emit(apiError)` 호출 후 throw. silent거나 statusCode가 401이면 발행 없이 throw. (401 갱신 후에도 실패한 최종 401 포함하여 토스트 제외)

- 재시도는 멱등성을 따지지 않는다(현재 백엔드 계약상 429는 처리 전 거절로 간주). 단, 백오프 대기는 응답 도착 후에만 수행하므로 중복 부작용 위험은 낮다. 필요 시 GET/PUT/DELETE만 재시도하도록 좁힐 수 있으나 1차 범위에선 전체 재시도.

### 2. `src/api/errorBus.ts` (신규)

초경량 동기 emitter. 외부 의존성 없음.

```ts
type Listener = (err: ApiError) => void;
const listeners = new Set<Listener>();
export const errorBus = {
  emit(err: ApiError) { listeners.forEach((l) => l(err)); },
  subscribe(l: Listener) { listeners.add(l); return () => listeners.delete(l); },
};
```

- `client.ts`가 import해야 하므로, 생성기 템플릿의 import 구문에 `import { errorBus } from './errorBus';`를 추가한다.

### 3. `src/api/errorMessages.ts` (신규)

`ApiError` → 사용자용 한글 메시지 매핑을 한곳에서 관리.

| 조건 | 메시지 |
|---|---|
| `code === 'RATE_LIMITED'` / `statusCode === 429` | 요청이 많아요. 잠시 후 다시 시도해주세요. |
| `code === 'NETWORK'` / `statusCode === 0` | 네트워크 연결을 확인해주세요. |
| `statusCode >= 500` | 일시적인 오류예요. 잠시 후 다시 시도해주세요. |
| 그 외 | 서버 `err.message` 우선, 없으면 "오류가 발생했어요. 잠시 후 다시 시도해주세요." |

```ts
export function toUserMessage(err: ApiError): string { /* 위 표 */ }
```

### 4. `src/components/ui/Toast.tsx` (신규)

`ToastProvider` + 토스트 UI.

- errorBus를 구독하여 들어온 `ApiError`를 `toUserMessage`로 변환해 큐에 넣는다.
- **dedup/debounce**: 같은 메시지는 5초 윈도우 내 1회만 표시(동시 폴링 스팸 방지 — 단 폴링은 `silent`라 대부분 도달하지 않음; 안전망).
- 자동 dismiss 약 3.5초. 동시에 1개만 표시(큐잉) 또는 최신 1개 교체 — **최신 1개 표시 + 큐 길이 1 상한**으로 단순화.
- 위치: 화면 하단, `react-native-safe-area-context`의 안전영역 고려.
- 애니메이션: 페이드/슬라이드, 기존 화면 전환(fade 180ms) 톤과 일관.
- 스타일: 인라인 `style` + theme colors. `fontFamily` 직접 작성 금지, `fontWeight`만.

### 5. `app/_layout.tsx`

- 루트에 `<ToastProvider>`를 마운트(기존 트리 최상위, 안전영역 Provider 안쪽).
- ToastProvider 내부에서 errorBus 구독을 `useEffect`로 등록/해제.

### 6. 생성기 + 재생성

- `scripts/generate-api.mjs`:
  - `generateClientCode()` 템플릿에 위 1·errorBus import 반영.
  - `generateCode()`의 래퍼 출력에 **선택적 `opts` 인자**를 추가하고 `apiFetch`로 전달. 예:
    ```ts
    export async function getSeatShares(opts?: { silent?: boolean }): Promise<...> {
      return apiFetch('/...', { method: 'GET', auth: true, ...opts });
    }
    ```
    - body/query가 있는 래퍼는 `opts`를 마지막 인자로 추가(기존 호출 하위호환 유지).
- 재생성 실행 후 `client.ts`/`generated.ts` diff 확인.

### 7. 호출부 침묵 처리

- 폴링 3곳: 폴링 호출에 `{ silent: true }` 전달.
  - `app/index.tsx` (`fetchEta` 폴링, 그 외 진입 시 호출 중 백그라운드성)
  - `app/getting-off-status.tsx` (poll)
  - `app/seat-seekers.tsx` (load/poll)
- 기존 `Alert.alert`로 안내하는 액션 호출 ~10곳: 해당 호출에 `{ silent: true }` 전달(중복 안내 방지).
  - 목록: `edit-car`, `edit-seat`, `edit-appearance`, `withdraw`, `mypage`(로그아웃), `(onboarding)/select-car`, `(onboarding)/select-line`, `(onboarding)/appearance`, `getting-off-status`(처리 실패), `seat-seekers`(열람/처리 실패) 중 Alert를 띄우는 호출.
  - 정확한 대상은 구현 단계에서 각 `catch`가 Alert를 띄우는 호출을 식별해 확정.

## 에러 흐름 (시나리오)

- **폴링 중 429**: apiFetch가 조용히 3회까지 재시도. 성공하면 사용자 모름. 끝내 실패해도 `silent`라 토스트 없음. 호출부는 기존대로 `return`.
- **사용자 액션(예: 좌석 공유 생성) 중 500**: 액션이 `Alert`를 띄우면 `silent:true`라 토스트 없음, Alert만. `Alert`가 없던 사용자 액션이면 토스트로 "일시적인 오류예요…".
- **네트워크 단절 중 사용자 동작**: `ApiError('NETWORK')` → 토스트 "네트워크 연결을 확인해주세요." (해당 호출이 silent가 아니면).
- **401**: 토큰 갱신 시도. 항상 토스트 제외.

## 테스트 전략

- `apiFetch` 단위 테스트(`fetch` 목): 429 → `Retry-After`(초/HTTP-date) 준수, 헤더 없을 때 지수 백오프, 최대 3회 후 `RATE_LIMITED` throw, 네트워크 throw → `NETWORK` 정규화, `silent` 시 emit 안 함/아닐 때 emit 함, 401은 갱신 경로 + emit 제외.
- `toUserMessage` 매핑 분기별 단위 테스트.
- ToastProvider dedup(5초 윈도우)·자동 dismiss 테스트.
- 회귀: 기존 `Alert.alert` 경로가 중복 토스트 없이 동작.

## 미해결/구현 시 결정

- 백오프 지터 적용 여부(권장: 적용) — 동시 폴링 thundering herd 완화.
- 재시도를 전체 메서드에 적용할지 GET 계열로 좁힐지 — 1차는 전체, 부작용 발견 시 좁힘.
- 토스트 큐 정책: "최신 1개 + 상한 1"로 단순화(확정), 추후 필요 시 스택.
