import { cancelSeatShare, createSeatShare } from './generated';
import { SEAT_ZONE_TO_POSITION } from '../constants/seatZone';

interface UpdateParams {
  currentShareId: string;
  trainId: string;
  getOffStationId: string;
  carriages: number[];
  seatZone: string;
  appearance: string;
}

// 백엔드에 PATCH /seat-shares/{id}가 없어서 DELETE + POST로 대체.
// 부수효과: shareId가 갱신되고, 짧은 시간 동안 viewer 측에서 해당 share를 찾을 수 없음.
export async function updateSeatShare(params: UpdateParams): Promise<string> {
  await cancelSeatShare(params.currentShareId);
  const res = await createSeatShare({
    trainId: params.trainId,
    getOffStationId: params.getOffStationId,
    carriages: params.carriages,
    seatPosition: SEAT_ZONE_TO_POSITION[params.seatZone],
    appearance: params.appearance,
  });
  return res.id!;
}
