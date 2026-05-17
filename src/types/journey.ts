export type Role = 'getting-off' | 'want-seat';

export interface Station {
  id: string;       // 서버 stationId (예: '1002000211')
  name: string;     // 한글 이름 (예: '성수')
  order: number;    // stationOrder (서버 기준)
  lineId: string;   // 서버 lineId (예: '1002')
}

export interface JourneyState {
  role: Role | null;
  lineId: string | null;
  trainId: string | null;        // 서버 trainId (운행 열차)
  stationId: string | null;      // 하차역 서버 stationId
  carNumbers: number[];
  seatZone: string | null;
  appearance: string;
  // 서버 등록 후 보관 (early-exit / cancel용)
  shareId: string | null;        // getting-off 플로우
  requestId: string | null;      // want-seat 플로우
}

export interface Person {
  id: string;
  stopsRemaining: number;
  carNumber: number;
  seatZone: string;
  appearance?: string;
  currentStation?: string;
  destinationStation?: string;
}
