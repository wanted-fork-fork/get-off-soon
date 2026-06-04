# 열차 선택 바텀시트 방면 탭 리디자인

날짜: 2026-06-04
대상 화면: `app/(onboarding)/select-line.tsx` — "현재 타고 있는 열차를 선택해주세요" 화면에서 역을 탭하면 열리는 `BottomSheet`

## 배경 / 목표

현재 바텀시트는 해당 역의 모든 열차를 방면 구분 없이 한 줄 목록으로 나열한다. 이를 **방면(인접역 방향) 탭으로 그룹핑**하고, 각 방면 안에서 열차를 라디오로 고르는 형태로 변경한다.

변경 범위는 `select-line.tsx`의 `BottomSheet` 내부 렌더링과 데이터 가공 로직으로 한정한다. 역 SVG, 히트존, `getTrainsByStation` 호출/캐시, `useJourney` 연동, `handleNext`는 그대로 둔다.

## API 근거 (실측 검증됨)

`GET /api/v1/subway/stations/{stationId}/trains` 응답 (서울대입구 `1002000228` 실호출):

```json
{ "trains": [ {
  "id": "1002-3464-0", "trainNo": "3464",
  "direction": "내선",            // 내선/외선 (또는 지선 상행/하행)
  "terminalStationName": "성수",   // 종착역(방면)
  "nextStationName": "낙성대",      // 다음 정차역 = 해당 역의 인접역
  "trainStatus": "전역출발", "trainStatusCode": 3,
  "isExpress": false, "isLastTrain": false
} ] }
```

검증된 사실:
- 응답 top-level 키는 `trains` 하나뿐. **방면 메타데이터는 열차 배열 밖에 없다.** → 한 방면에 열차가 0대면 그 방면 정보는 응답에 존재하지 않는다.
- `GET /api/v1/subway/lines/{lineId}/stations` 응답은 `{ id, name, stationOrder }`만 제공. 인접역/방면 정보 없음.
- 열차가 있을 때 `nextStationName`은 선택역의 **인접역과 정확히 일치**한다. 따라서 `nextStationName` 기반 라벨과 `stationOrder`(인접역) 기반 라벨은 열차가 있는 한 항상 동일하다.

결론: 탭 라벨은 `subway.ts`의 `stationOrder`로 구한 양 옆 인접역으로 만든다. 열차가 있는 방면은 `nextStationName`과 동일하므로 API 의도와 일치하고, 열차 0대인 방면도 이름이 채워진다.

## UI 명세

### 헤더
- 2호선 초록 원형 뱃지(`colors.line[2]` = `#00A44A`, 안에 "2") + **선택한 역 이름**.

### 방면 탭 (세그먼트 토글, 2개)
- 가로 2등분 토글. 선택 탭은 파란 배경(`colors.accent.blue`) + 흰 글씨, 비선택은 회색 배경(`colors.surface.input`) + `colors.fg.muted` 글씨.
- 라벨: `"{인접역명} 방향"` (예: `봉천 방향`, `낙성대 방향`).
- 탭 표시 순서: `directionKey` 우선순위 `['외선','상행','내선','하행']` 순. (서울대입구 → 외선=봉천, 내선=낙성대 → "봉천 방향" → "낙성대 방향", 목업과 일치.) 양쪽 다 열차가 없어 `directionKey`를 모르면 인접역 `stationOrder` 내림차순으로 정렬.
- 탭 전환 시 선택돼 있던 열차는 초기화한다.

### 탭별 본문
- **열차 있음**: 해당 방면 열차를 *전부* 라디오 항목으로 나열.
  - 라벨 = `trainStatusCode` 매핑:
    `0 당역 접근 / 1 당역 도착 / 2 당역 출발 / 3 전역 출발 / 4 전역 진입 / 5 전역 도착 / 99 운행중`.
    매핑에 없으면 `train.trainStatus`(API 문자열) → 그것도 없으면 `${trainNo}열차`로 폴백.
  - 정렬: 가까운 순. `trainStatusCode` 우선순위 `[1, 0, 2, 5, 4, 3, 99]` (당역 도착이 가장 가까움). 코드 없으면 맨 뒤.
  - 하단 `다음` 버튼. 열차 미선택 시 `disabled`.
- **열차 없음**: 문구
  `도착 예정이거나 도착한 열차가 없습니다.\n열차가 역에 있을 때 다시 시도해주세요.`
  + `닫기` 버튼 (`다음` 대신).

### 기본 선택 탭
- 표시 순서상 **열차가 있는 첫 번째 방면**을 기본 선택. 양쪽 다 없으면 첫 번째 탭.

### 로딩 / 예외
- `loadingTrains` 동안 `ActivityIndicator` (현행 유지).
- 선택역이 `STATION_BY_NAME`에 없어 인접역을 못 구하면 탭 없이 빈 상태 문구 + `닫기`.

## 데이터 가공 로직

`select-line.tsx` 안에 헬퍼로 구현 (별도 파일 불필요, 화면 전용 로직).

1. **인접역 계산** `getNeighbors(stationName)`:
   - `STATION_BY_NAME`으로 선택역의 `order` 조회.
   - 본선(`order ≤ 43`, 순환): prev = order `((N-2+43)%43)+1`, next = order `(N%43)+1` (1↔43 wrap).
   - 지선(`order ≥ 44`): `order±1`이 같은 지선 범위 내에 있을 때만 인접으로 취급(best-effort).
   - 인접역 이름 배열(최대 2개) 반환.
2. **방면 그룹핑**: 반환된 trains를 `direction` 문자열로 그룹핑. 각 그룹 라벨 인접역 = 그룹 첫 열차의 `nextStationName`.
3. **탭 2개 구성**:
   - 열차 있는 그룹 → `{ directionKey, neighborName: nextStationName, trains }`.
   - 아직 탭에 안 쓰인 인접역 이름 → `{ directionKey: undefined, neighborName, trains: [] }`로 채워 최대 2개.
   - 우선순위 규칙으로 정렬.
4. **상태**: `selectedDirection`(탭 인덱스 또는 키) 상태 추가. `selectedTrain`은 유지하되 탭 전환 시 `null` 초기화.

## 정리(제거)할 죽은 코드
- 기존 항목의 부가 텍스트 `{trainNo}열차 · {currentStationId의 역명}` — 현재 타입에 `currentStationId`가 없어 항상 "정보 없음"으로 표시되는 죽은 코드.
- `typeof train.trainStatus === 'number'` 비교 — 현재 `trainStatus`는 string 타입이라 항상 false로 빠지는 버그. `trainStatusCode` 기반 매핑으로 대체.

## 검증 방법
- 양 방면 모두 열차 있음 / 한쪽만 있음 / 양쪽 다 없음(0대) 3케이스에서 탭 라벨·기본선택·빈 상태·`다음`/`닫기` 분기 확인.
- 탭 전환 시 선택 초기화 및 `다음` disabled 복귀 확인.
- 실데이터로 `nextStationName`이 인접역과 일치하는지(라벨 일관성) 확인.
