import { Station } from '../types/journey';

// 서버 lineId
export const LINE_2_ID = '1002';

// 2호선 전체 역 (서버 stationOrder 기준)
// 본선 1~43: 시청 → 충정로 (순환)
// 성수지선 44~47: 용답 → 신설동
// 신정지선 48~51: 도림천 → 까치산
export const LINE_2_STATIONS: Station[] = [
  // 본선
  { id: '1002000201', name: '시청',             order: 1,  lineId: LINE_2_ID },
  { id: '1002000202', name: '을지로입구',       order: 2,  lineId: LINE_2_ID },
  { id: '1002000203', name: '을지로3가',        order: 3,  lineId: LINE_2_ID },
  { id: '1002000204', name: '을지로4가',        order: 4,  lineId: LINE_2_ID },
  { id: '1002000205', name: '동대문역사문화공원', order: 5,  lineId: LINE_2_ID },
  { id: '1002000206', name: '신당',             order: 6,  lineId: LINE_2_ID },
  { id: '1002000207', name: '상왕십리',         order: 7,  lineId: LINE_2_ID },
  { id: '1002000208', name: '왕십리',           order: 8,  lineId: LINE_2_ID },
  { id: '1002000209', name: '한양대',           order: 9,  lineId: LINE_2_ID },
  { id: '1002000210', name: '뚝섬',             order: 10, lineId: LINE_2_ID },
  { id: '1002000211', name: '성수',             order: 11, lineId: LINE_2_ID },
  { id: '1002000212', name: '건대입구',         order: 12, lineId: LINE_2_ID },
  { id: '1002000213', name: '구의',             order: 13, lineId: LINE_2_ID },
  { id: '1002000214', name: '강변',             order: 14, lineId: LINE_2_ID },
  { id: '1002000215', name: '잠실나루',         order: 15, lineId: LINE_2_ID },
  { id: '1002000216', name: '잠실',             order: 16, lineId: LINE_2_ID },
  { id: '1002000217', name: '잠실새내',         order: 17, lineId: LINE_2_ID },
  { id: '1002000218', name: '종합운동장',       order: 18, lineId: LINE_2_ID },
  { id: '1002000219', name: '삼성',             order: 19, lineId: LINE_2_ID },
  { id: '1002000220', name: '선릉',             order: 20, lineId: LINE_2_ID },
  { id: '1002000221', name: '역삼',             order: 21, lineId: LINE_2_ID },
  { id: '1002000222', name: '강남',             order: 22, lineId: LINE_2_ID },
  { id: '1002000223', name: '교대',             order: 23, lineId: LINE_2_ID },
  { id: '1002000224', name: '서초',             order: 24, lineId: LINE_2_ID },
  { id: '1002000225', name: '방배',             order: 25, lineId: LINE_2_ID },
  { id: '1002000226', name: '사당',             order: 26, lineId: LINE_2_ID },
  { id: '1002000227', name: '낙성대',           order: 27, lineId: LINE_2_ID },
  { id: '1002000228', name: '서울대입구',       order: 28, lineId: LINE_2_ID },
  { id: '1002000229', name: '봉천',             order: 29, lineId: LINE_2_ID },
  { id: '1002000230', name: '신림',             order: 30, lineId: LINE_2_ID },
  { id: '1002000231', name: '신대방',           order: 31, lineId: LINE_2_ID },
  { id: '1002000232', name: '구로디지털단지',   order: 32, lineId: LINE_2_ID },
  { id: '1002000233', name: '대림',             order: 33, lineId: LINE_2_ID },
  { id: '1002000234', name: '신도림',           order: 34, lineId: LINE_2_ID },
  { id: '1002000235', name: '문래',             order: 35, lineId: LINE_2_ID },
  { id: '1002000236', name: '영등포구청',       order: 36, lineId: LINE_2_ID },
  { id: '1002000237', name: '당산',             order: 37, lineId: LINE_2_ID },
  { id: '1002000238', name: '합정',             order: 38, lineId: LINE_2_ID },
  { id: '1002000239', name: '홍대입구',         order: 39, lineId: LINE_2_ID },
  { id: '1002000240', name: '신촌',             order: 40, lineId: LINE_2_ID },
  { id: '1002000241', name: '이대',             order: 41, lineId: LINE_2_ID },
  { id: '1002000242', name: '아현',             order: 42, lineId: LINE_2_ID },
  { id: '1002000243', name: '충정로',           order: 43, lineId: LINE_2_ID },
  // 성수지선
  { id: '1002002111', name: '용답',             order: 44, lineId: LINE_2_ID },
  { id: '1002002112', name: '신답',             order: 45, lineId: LINE_2_ID },
  { id: '1002002113', name: '용두',             order: 46, lineId: LINE_2_ID },
  { id: '1002002114', name: '신설동',           order: 47, lineId: LINE_2_ID },
  // 신정지선
  { id: '1002002341', name: '도림천',           order: 48, lineId: LINE_2_ID },
  { id: '1002002342', name: '양천구청',         order: 49, lineId: LINE_2_ID },
  { id: '1002002343', name: '신정네거리',       order: 50, lineId: LINE_2_ID },
  { id: '1002002344', name: '까치산',           order: 51, lineId: LINE_2_ID },
];

export const SUBWAY_LINES = [
  {
    id: LINE_2_ID,
    name: '2호선',
    color: '#00A84D',
    stations: LINE_2_STATIONS,
    isCircular: true,
  },
];

// 한글 이름 → Station lookup (SVG 탭 좌표 → server stationId 변환용)
export const STATION_BY_NAME: Record<string, Station> = Object.fromEntries(
  LINE_2_STATIONS.map(s => [s.name, s]),
);

// 서버 stationId → Station lookup (상태에서 표시용 이름 가져올 때)
export const STATION_BY_ID: Record<string, Station> = Object.fromEntries(
  LINE_2_STATIONS.map(s => [s.id, s]),
);
