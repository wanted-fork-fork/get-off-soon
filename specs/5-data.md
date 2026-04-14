# 데이터 레이어

타입 정의, 상수, 상태 관리.

---

## 타입 정의

**파일**: `src/types/journey.ts`

```ts
export type Role = 'getting-off' | 'want-seat';

export interface Station {
  id: string;           // 예: 'seongsu'
  name: string;         // 예: '성수'
  lineIds: string[];    // 소속 노선 (환승역 대응)
  order: number;        // 노선 내 순서 (방향 계산용)
}

export interface SubwayLine {
  id: string;           // 예: 'line-2'
  name: string;         // 예: '2호선'
  color: string;        // 예: '#00A44A'
  stations: Station[];
  isCircular: boolean;  // 2호선은 true
}

export interface JourneyState {
  role: Role | null;
  lineId: string | null;
  stationId: string | null;    // 하차 예정역
  carNumbers: number[];        // 탑승칸 (최대 2개)
  seatZone: string | null;     // 좌석 구역 (getting-off만)
  appearance: string;          // 인상착의 (getting-off만)
}

export interface Person {
  id: string;
  stopsRemaining: number;
  carNumber: number;
  seatZone: string;
  appearance?: string;
}
```

---

## 지하철 상수

**파일**: `src/constants/subway.ts`

2호선 역 목록 (Figma 노선도에서 확인된 순서):

```ts
export const LINE_2_STATIONS: Station[] = [
  { id: 'sindorim', name: '신도림', lineIds: ['line-1', 'line-2'], order: 0 },
  { id: 'dorimcheon', name: '도림천', lineIds: ['line-2'], order: 1 },
  { id: 'yangcheongu', name: '양천구청', lineIds: ['line-2'], order: 2 },
  { id: 'sinjeong', name: '신정네거리', lineIds: ['line-2'], order: 3 },
  { id: 'kkachi', name: '까치산', lineIds: ['line-2'], order: 4 },
  // ... (총 49개 역)
];

export const SUBWAY_LINES: SubwayLine[] = [
  {
    id: 'line-2',
    name: '2호선',
    color: '#00A44A',
    stations: LINE_2_STATIONS,
    isCircular: true,
  },
];
```

전체 역 순서 (Figma 노선도 기준):
```
신도림 - 도림천 - 양천구청 - 신정네거리 - 까치산 - 영등포구청 - 당산 - 합정
- 홍대입구 - 신촌 - 이대 - 아현 - 충정로 - 시청 - 을지로입구 - 을지로3가
- 을지로4가 - 동대문역사문화공원 - 신설동 - 신당 - 상왕십리 - 왕십리 - 한양대
- 뚝섬 - 성수 (← 지선 분기) - 건대입구 - 구의 - 강변 - 잠실나루 - 잠실
- 잠실새내 - 종합운동장 - 삼성 - 선릉 - 역삼 - 강남 - 교대 - 서초 - 방배
- 사당 - 낙성대 - 서울대입구 - 봉천 - 신림 - 신대방 - 구로디지털단지 - 대림 - 신도림
```

---

## 좌석 구역 상수

**파일**: `src/constants/seat.ts`

```ts
export const SEAT_ZONES = [
  { id: 'A', label: 'A구역', position: 'top-left' },
  { id: 'B', label: 'B구역', position: 'top-right' },
  { id: 'C', label: 'C구역', position: 'middle-left' },
  { id: 'D', label: 'D구역', position: 'middle-right' },
  { id: 'E', label: 'E구역', position: 'bottom-left' },
  { id: 'F', label: 'F구역', position: 'bottom-right' },
] as const;
```

---

## JourneyContext

**파일**: `src/context/JourneyContext.tsx`

```ts
const initialState: JourneyState = {
  role: null,
  lineId: null,
  stationId: null,
  carNumbers: [],
  seatZone: null,
  appearance: '',
};

// 제공 액션
setRole(role: Role)
setLine(lineId: string)
setStation(stationId: string)
toggleCar(carNumber: number)    // 최대 2개, 이미 있으면 제거
setSeatZone(zone: string)
setAppearance(text: string)
reset()
```

`app/_layout.tsx`에서 `JourneyProvider`로 전체 앱 감싸기.

---

## Mock 데이터 (개발용)

**파일**: `src/constants/mock.ts`

API 연동 전 UI 개발용 더미 데이터.

```ts
export const MOCK_PERSONS: Person[] = [
  { id: '1', stopsRemaining: 2, carNumber: 5, seatZone: 'B', appearance: '검정 패딩, 흰 운동화' },
  { id: '2', stopsRemaining: 3, carNumber: 5, seatZone: 'D', appearance: '빨간 가방' },
  { id: '3', stopsRemaining: 5, carNumber: 5, seatZone: 'A' },
];
```
