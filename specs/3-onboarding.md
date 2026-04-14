# 온보딩 플로우

두 역할 모두 동일한 온보딩 라우트 그룹 `(onboarding)` 을 사용하며, Context에 저장된 `role`에 따라 단계 수와 마지막 화면이 달라진다.

## 라우팅 흐름

```
메인 홈
  ↓ "곧 내려요" 탭
  (onboarding)/select-line   [1/5]
  ↓
  (onboarding)/select-station [2/5]
  ↓
  (onboarding)/select-car    [3/5]
  ↓
  (onboarding)/select-seat   [4/5]  ← 앉고 싶어요는 이 단계 없음
  ↓
  (onboarding)/appearance    [5/5]  ← 앉고 싶어요는 이 단계 없음
  ↓
  seat-seekers (활성 여정)

메인 홈
  ↓ "앉고 싶어요" 탭
  (onboarding)/select-line   [1/3]
  ↓
  (onboarding)/select-station [2/3]
  ↓
  (onboarding)/select-car    [3/3]
  ↓
  getting-off-list (활성 여정)
```

---

## (onboarding)/_layout.tsx

공통 래퍼. 모든 온보딩 화면이 공유.

- `TopBar` (뒤로가기만, 우측 없음)
- `ProgressBar` (current/total은 각 화면에서 전달)
- `Stack.Screen` 헤더 숨김

---

## select-line.tsx — 열차 선택

**진행**: 1단계  
**제목**: "현재 타고 있는 열차를 선택해주세요." (18px/600, `#E4E5E6`)

### 레이아웃

```
[ TopBar + ProgressBar ]
[ 제목 텍스트 ]
[ 노선도 (ScrollView, 가로 스크롤) ]
[ 선택된 노선 칩 ] ← 선택 후 표시 (예: "2호선")
[ 다음 버튼 (비활성 → 선택 후 활성) ]
```

### 노선도 UI

- Figma 노드 `Frame 352` (1120×588) 기반
- 2호선: 원형 루프 + 각 역 표시 (흰색 점 12×12)
- 현재는 **2호선만 구현** (MVP)
- 역 이름 텍스트: `#FFFFFF`, 14px/500, Pretendard
- 선택된 열차는 노선 칩으로 표시: `#272C35` 배경 + 텍스트 (예: "2호선")
- 노선도는 `react-native-svg` 또는 정적 이미지로 구현

### 2호선 역 목록

`src/constants/subway.ts`에서 가져옴.

```
신도림 → 대림 → 구로디지털단지 → 신대방 → 신림 → 봉천 → 서울대입구
→ 낙성대 → 사당 → 방배 → 서초 → 교대 → 강남 → 역삼 → 선릉 → 삼성
→ 종합운동장 → 잠실나루 → 잠실 → 잠실새내 → 건대입구 → 구의 → 강변
→ 뚝섬 → 성수 → 한양대 → 용답 → 신답 → 용두 → 왕십리 → 상왕십리
→ 신당 → 신설동 → 동대문역사문화공원 → 을지로4가 → 을지로3가
→ 을지로입구 → 시청 → 충정로 → 아현 → 이대 → 신촌 → 홍대입구
→ 합정 → 당산 → 영등포구청 → 까치산 → 신정네거리 → 양천구청 → 도림천 → (신도림으로)
```

---

## select-station.tsx — 역 선택

**진행**: 2단계  
**제목**: "하차 예정인 역을 선택해주세요." (18px/600)

### 레이아웃

```
[ TopBar + ProgressBar ]
[ 제목 텍스트 ]
[ 노선도 (선택된 노선 표시, 현재 역 강조) ]
[ 다음 버튼 (역 선택 후 활성) ]
```

### 동작

- 앞 단계에서 선택한 노선의 역 목록 표시
- 노선도에서 역 탭 → 선택 (강조 표시)
- 선택된 역 이름은 ProgressBar 아래 별도 표시 가능

---

## select-car.tsx — 탑승칸 선택

**진행**: 3단계 (곧 내려요) / 3단계 (앉고 싶어요)  
**제목**: "현재 탑승칸 위치를 선택해주세요." (18px/600)  
**부제**: "최대 두 칸까지 선택할 수 있어요." (16px/400, `#92969F`)

### 레이아웃

```
[ TopBar + ProgressBar ]
[ 제목 ]
[ 부제목 ]
[ CarTabs (0~9 수평 스크롤) ]
[ 열차 배치도 (Frame 327, 361×180) ]  ← 칸 위치 시각화
[ 다음 버튼 ]
```

### 열차 배치도

- 선택된 탑승칸의 위치를 열차 단면 SVG로 표시
- 탑승칸 번호 0~9, 최대 2개 선택 가능
- 미선택: 회색, 선택: 파란색 하이라이트

---

## select-seat.tsx — 좌석 구역 선택

**진행**: 4단계 (곧 내려요만)  
**제목**: "앉아있는 좌석의 구역을 선택해주세요." (18px/600)

### 레이아웃

```
[ TopBar + ProgressBar ]
[ 제목 ]
[ 좌석 배치도 SVG ]
[ 출입문 방향 라벨 (Frame 330, 331) ]
[ 구역 선택 버튼 그룹 (Frame 336~338) ]
[ 좌석 번호 표시 ]
[ 다음 버튼 ]
```

### 좌석 배치도 구조 (Figma에서 추출)

```
  [문] [A구역] [B구역] [문]
  [C구역]          [D구역]
  [문] [E구역] [F구역] [문]
```

- 6개 구역 버튼: Frame 336, 337, 338, 333, 334(혹은 335)
- 각 구역 88×40, 보더 반지름 8px
- 비활성: `#272B34`, 활성: `#2C63D2`

---

## appearance.tsx — 인상착의 입력

**진행**: 5단계 (곧 내려요만)  
**제목**: "착석 희망자가 자리를 찾아오는데 도움이 될 만한 인상착의를 알려주세요." (16px/400)

### 레이아웃

```
[ TopBar + ProgressBar ]
[ 제목 (두 줄) ]
[ TextInput (Frame 225, 361×40) ]
[ 완료 버튼 → seat-seekers.tsx 로 이동 ]
```

### TextInput 스타일

- 배경: `#272B34`
- 텍스트: `#E4E5E7`
- 플레이스홀더: `#797E86`
- 보더 반지름: 8px
- 높이: 40px (단일 행), 입력 시 확장 가능

---

## JourneyContext

**파일**: `src/context/JourneyContext.tsx`

온보딩 전 단계에 걸쳐 선택값을 공유하는 Context.

```ts
interface JourneyState {
  role: 'getting-off' | 'want-seat' | null;
  lineId: string | null;           // 예: 'line-2'
  stationId: string | null;        // 하차역 ID
  carNumbers: number[];            // 탑승칸 번호 (최대 2개)
  seatZone: string | null;         // 좌석 구역 (곧 내려요만)
  appearance: string;              // 인상착의 (곧 내려요만)
}
```

Action: `setRole`, `setLine`, `setStation`, `setCar`, `setSeatZone`, `setAppearance`, `reset`
