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
  stationId: string | null;
  carNumbers: number[];
  seatZone: string | null;
  appearance: string;
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
