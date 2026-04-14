import React, { createContext, useContext, useState, ReactNode } from 'react';
import { JourneyState, Role } from '../types/journey';

const initialState: JourneyState = {
  role: null,
  lineId: null,
  stationId: null,
  carNumbers: [],
  seatZone: null,
  appearance: '',
};

interface JourneyContextType {
  state: JourneyState;
  setRole: (role: Role) => void;
  setLine: (lineId: string) => void;
  setStation: (stationId: string) => void;
  toggleCar: (carNumber: number) => void;
  setSeatZone: (zone: string) => void;
  setAppearance: (text: string) => void;
  reset: () => void;
}

const JourneyContext = createContext<JourneyContextType | null>(null);

export function JourneyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<JourneyState>(initialState);

  const setRole = (role: Role) => setState(s => ({ ...s, role }));
  const setLine = (lineId: string) => setState(s => ({ ...s, lineId }));
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
  const reset = () => setState(initialState);

  return (
    <JourneyContext.Provider value={{ state, setRole, setLine, setStation, toggleCar, setSeatZone, setAppearance, reset }}>
      {children}
    </JourneyContext.Provider>
  );
}

export function useJourney() {
  const ctx = useContext(JourneyContext);
  if (!ctx) throw new Error('useJourney must be used within JourneyProvider');
  return ctx;
}
