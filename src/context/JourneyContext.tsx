import React, { createContext, useContext, useState, ReactNode } from 'react';
import { JourneyState, Role } from '../types/journey';

const initialState: JourneyState = {
  role: null,
  lineId: null,
  trainId: null,
  stationId: null,
  carNumbers: [],
  seatZone: null,
  appearance: '',
  shareId: null,
  requestId: null,
};

interface JourneyContextType {
  state: JourneyState;
  setRole: (role: Role) => void;
  setLine: (lineId: string) => void;
  setTrainId: (trainId: string) => void;
  setStation: (stationId: string) => void;
  toggleCar: (carNumber: number) => void;
  setSeatZone: (zone: string) => void;
  setAppearance: (text: string) => void;
  setShareId: (shareId: string | null) => void;
  setRequestId: (requestId: string | null) => void;
  reset: () => void;
}

const JourneyContext = createContext<JourneyContextType | null>(null);

export function JourneyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<JourneyState>(initialState);

  const setRole = (role: Role) => setState(s => ({ ...s, role }));
  const setLine = (lineId: string) => setState(s => ({ ...s, lineId }));
  const setTrainId = (trainId: string) => setState(s => ({ ...s, trainId }));
  const setStation = (stationId: string) => setState(s => ({ ...s, stationId }));
  const toggleCar = (carNumber: number) =>
    setState(s => {
      const already = s.carNumbers.includes(carNumber);
      if (already) return { ...s, carNumbers: s.carNumbers.filter(n => n !== carNumber) };
      if (s.carNumbers.length >= 2) return s;
      return { ...s, carNumbers: [...s.carNumbers, carNumber] };
    });
  const setSeatZone = (seatZone: string) => setState(s => ({ ...s, seatZone }));
  const setAppearance = (appearance: string) => setState(s => ({ ...s, appearance }));
  const setShareId = (shareId: string | null) => setState(s => ({ ...s, shareId }));
  const setRequestId = (requestId: string | null) => setState(s => ({ ...s, requestId }));
  const reset = () => setState(initialState);

  return (
    <JourneyContext.Provider
      value={{
        state,
        setRole,
        setLine,
        setTrainId,
        setStation,
        toggleCar,
        setSeatZone,
        setAppearance,
        setShareId,
        setRequestId,
        reset,
      }}
    >
      {children}
    </JourneyContext.Provider>
  );
}

export function useJourney() {
  const ctx = useContext(JourneyContext);
  if (!ctx) throw new Error('useJourney must be used within JourneyProvider');
  return ctx;
}
