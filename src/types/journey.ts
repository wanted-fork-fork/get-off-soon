export type Role = 'getting-off' | 'want-seat';

export interface Station {
  id: string;
  name: string;
  order: number;
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
