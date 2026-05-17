export const SEAT_ZONE_LABELS: Record<string, string> = {
  A: '가는 방향 기준 왼쪽 앞 구역',
  B: '가는 방향 기준 오른쪽 앞 구역',
  C: '가는 방향 기준 왼쪽 중간 구역',
  D: '가는 방향 기준 오른쪽 중간 구역',
  E: '가는 방향 기준 왼쪽 뒤 구역',
  F: '가는 방향 기준 오른쪽 뒤 구역',
};

export function getSeatZoneLabel(zone: string | null): string {
  if (!zone) return '미선택';
  return SEAT_ZONE_LABELS[zone] ?? zone;
}

// 서버 seatPosition 매핑 (좌상=1, 우상=2, 좌중=3, 우중=4, 좌하=5, 우하=6)
export const SEAT_ZONE_TO_POSITION: Record<string, number> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
};

export const SEAT_POSITION_TO_ZONE: Record<number, string> = Object.fromEntries(
  Object.entries(SEAT_ZONE_TO_POSITION).map(([z, p]) => [p, z]),
);
