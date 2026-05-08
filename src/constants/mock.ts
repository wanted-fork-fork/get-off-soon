import { Person } from '../types/journey';

export const MOCK_PERSONS: Person[] = [
  {
    id: '1',
    stopsRemaining: 1,
    carNumber: 5,
    seatZone: 'B',
    appearance: '검정 패딩 점퍼, 흰색 운동화, 파란 백팩',
    currentStation: '강남',
    destinationStation: '삼성',
  },
  {
    id: '2',
    stopsRemaining: 2,
    carNumber: 5,
    seatZone: 'D',
    appearance: '빨간 숄더백, 베이지 코트',
    currentStation: '강남',
    destinationStation: '종합운동장',
  },
  {
    id: '3',
    stopsRemaining: 3,
    carNumber: 5,
    seatZone: 'A',
    currentStation: '강남',
    destinationStation: '잠실새내',
  },
  {
    id: '4',
    stopsRemaining: 3,
    carNumber: 4,
    seatZone: 'C',
    appearance: '초록색 니트, 검정 슬랙스',
    currentStation: '강남',
    destinationStation: '잠실새내',
  },
  {
    id: '5',
    stopsRemaining: 5,
    carNumber: 6,
    seatZone: 'F',
    appearance: '회색 후드티, 청바지',
    currentStation: '강남',
    destinationStation: '잠실',
  },
];
