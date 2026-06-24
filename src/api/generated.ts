// ──────────────────────────────────────────────────────
// 이 파일은 scripts/generate-api.mjs 로 자동 생성됩니다.
// 직접 수정하지 마세요.
// ──────────────────────────────────────────────────────

import { apiFetch, type ApiRequestOptions } from './client';

export type DevLoginRequest = {
  providerId?: string;
  name?: string;
};

export type DevLoginResponse = {
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id?: string;
    name?: string;
    rewardPoints?: number;
    role?: string;
  };
};

export type SocialLoginRequest = {
  accessToken: string;
};

export type SocialLoginResponse = {
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id?: string;
    name?: string;
    rewardPoints?: number;
    role?: string;
  };
};

export type CreateAuthGuestRequest = {
  deviceId: string;
  timestamp: number;
  signature: string;
  name?: string;
};

export type CreateAuthGuestResponse = {
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id?: string;
    name?: string;
    rewardPoints?: number;
    role?: string;
  };
};

export type RefreshTokenRequest = {
  refreshToken: string;
};

export type RefreshTokenResponse = {
  accessToken?: string;
};

export type GetMeResponse = {
  id?: string;
  name?: string;
  provider?: string;
  rewardPoints?: number;
  role?: string;
  createdAt?: string;
};

export type UpdateMyNameRequest = {
  name: string;
};

export type UpdateMyNameResponse = {
  id?: string;
  name?: string;
  provider?: string;
  rewardPoints?: number;
  role?: string;
  createdAt?: string;
};

export type UpdateFcmTokenRequest = {
  fcmToken: string;
};

export type UpdateFcmTokenResponse = {
  fcmToken?: string;
};

export type GetUsersMeRewardPointsResponse = {
  rewardPoints?: number;
};

export type GetRewardsResponse = {
  rewardPoints?: number;
  history?: Array<{
    id?: string;
    type?: string;
    label?: string;
    amount?: number;
    createdAt?: string;
    share?: {
      boardStationName?: string;
      boardLineName?: string;
      boardLineColor?: string;
      getOffStationName?: string;
      getOffLineName?: string;
      getOffLineColor?: string;
    } | null;
  }>;
};

export type CheckinResponse = {
  rewardPoints?: number;
  checkinDate?: string;
  rewarded?: boolean;
};

export type ClaimAdRewardResponse = {
  rewardPoints?: number;
};

export type GetSubwayLinesResponse = {
  lines?: Array<{
    id?: string;
    name?: string;
    color?: string;
    isCircular?: boolean;
  }>;
};

export type GetTrainsByLineResponse = {
  trains?: Array<{
    id?: string;
    lineId?: string;
    trainNo?: string;
    direction?: number;
    currentStationId?: string | null;
    terminalStationId?: string | null;
    trainStatus?: number | null;
    isExpress?: number | null;
    isLastTrain?: number | null;
    status?: string;
  }>;
};

export type GetStationsByLineResponse = {
  stations?: Array<{
    id?: string;
    lineId?: string;
    name?: string;
  }>;
  edges?: Array<{
    fromStationId?: string;
    toStationId?: string;
    direction?: number;
  }>;
};

export type GetTrainsDebugResponse = {
  trains?: Array<{
    id?: string;
    trainNo?: string;
    lineName?: string;
    direction?: string;
    currentStationName?: string | null;
    terminalStationName?: string | null;
    trainStatus?: string;
    isExpress?: boolean;
    isLastTrain?: boolean;
    updatedAt?: string;
  }>;
};

export type GetTrainsByStationResponse = {
  stationName?: string | null;
  connections?: Array<{
    direction?: string;
    directionCode?: number;
    nextStationId?: string;
    nextStationName?: string;
    hasTrains?: boolean;
    trains?: Array<{
      id?: string;
      trainNo?: string;
      terminalStationName?: string | null;
      trainStatus?: string;
      trainStatusCode?: number | null;
      isExpress?: boolean;
      isLastTrain?: boolean;
    }>;
  }>;
};

export type CreateSeatShareRequest = {
  trainId: string;
  getOffStationId: string;
  carriages: number[];
  seatPosition: number;
  appearance: string;
};

export type CreateSeatShareResponse = {
  id?: string;
  trainId?: string;
  boardStationName?: string;
  getOffStationName?: string;
  carriages?: number[];
  seatPosition?: number;
  appearance?: string;
  status?: string;
  createdAt?: string;
};

export type GetMySeatShareResponse = {
  id?: string;
  trainId?: string;
  boardStationName?: string;
  getOffStationName?: string;
  carriages?: number[];
  seatPosition?: number;
  appearance?: string;
  status?: string;
  createdAt?: string;
} | null;

export type GetSeatSharesMeStatusResponse = {
  phase?: 'active' | 'completed' | 'none';
  share?: {
    id?: string;
    trainId?: string;
    boardStationName?: string;
    getOffStationName?: string;
    carriages?: number[];
    seatPosition?: number;
    appearance?: string;
    status?: string;
    createdAt?: string;
  } | null;
  progress?: {
    currentStationId?: string | null;
    currentStationName?: string | null;
    nextStationName?: string | null;
    trainStatus?: string;
    trainStatusCode?: number | null;
    direction?: string;
    directionCode?: number;
    remainingStops?: number | null;
    arrived?: boolean;
  } | null;
  result?: {
    boardStation?: {
      name?: string;
      lineName?: string;
      lineColor?: string;
    };
    getOffStation?: {
      name?: string;
      lineName?: string;
      lineColor?: string;
    };
    completedAt?: string;
    status?: string;
    earnedReward?: number;
    remainingReward?: number;
  } | null;
};

export type GetSeatSharesMeLatestCompletedResponse = {
  boardStation?: {
    name?: string;
    lineName?: string;
    lineColor?: string;
  };
  getOffStation?: {
    name?: string;
    lineName?: string;
    lineColor?: string;
  };
  completedAt?: string;
  status?: string;
  earnedReward?: number;
  remainingReward?: number;
} | null;

export type GetSeatSharesMeRecentCompletedResponse = {
  boardStation?: {
    name?: string;
    lineName?: string;
    lineColor?: string;
  };
  getOffStation?: {
    name?: string;
    lineName?: string;
    lineColor?: string;
  };
  completedAt?: string;
  status?: string;
  earnedReward?: number;
  remainingReward?: number;
} | null;

export type UpdateSeatSharesRequest = {
  carriages?: number[];
  seatPosition?: number;
  appearance?: string;
  getOffStationId?: string;
};

export type UpdateSeatSharesResponse = {
  id?: string;
  trainId?: string;
  boardStationName?: string;
  getOffStationName?: string;
  carriages?: number[];
  seatPosition?: number;
  appearance?: string;
  status?: string;
  createdAt?: string;
};

export type CancelSeatShareResponse = Record<string, never>;

export type EarlyExitSeatShareResponse = Record<string, never>;

export type CreateSeatRequestRequest = {
  trainId: string;
  getOffStationId: string;
  carriages: number[];
};

export type CreateSeatRequestResponse = {
  id?: string;
  trainId?: string;
  boardStationName?: string;
  getOffStationName?: string;
  carriages?: number[];
  status?: 'active' | 'completed' | 'early_exit' | 'cancelled';
  createdAt?: string;
};

export type GetMySeatRequestResponse = {
  id?: string;
  trainId?: string;
  boardStationName?: string;
  getOffStationName?: string;
  carriages?: number[];
  status?: 'active' | 'completed' | 'early_exit' | 'cancelled';
  createdAt?: string;
};

export type GetSeatRequestsMeStatusResponse = {
  phase?: 'active' | 'completed' | 'none';
  request?: {
    id?: string;
    trainId?: string;
    boardStationName?: string;
    getOffStationName?: string;
    carriages?: number[];
    status?: 'active' | 'completed' | 'early_exit' | 'cancelled';
    createdAt?: string;
  } | null;
  progress?: {
    currentStationId?: string | null;
    currentStationName?: string | null;
    nextStationName?: string | null;
    trainStatus?: string;
    trainStatusCode?: number | null;
    direction?: string;
    directionCode?: number;
    remainingStops?: number | null;
    arrived?: boolean;
  } | null;
  result?: {
    boardStation?: {
      name?: string;
      lineName?: string;
      lineColor?: string;
    };
    getOffStation?: {
      name?: string;
      lineName?: string;
      lineColor?: string;
    };
    completedAt?: string;
    status?: string;
    spentReward?: number;
    remainingReward?: number;
  } | null;
};

export type GetSeatRequestsMeLatestCompletedResponse = {
  boardStation?: {
    name?: string;
    lineName?: string;
    lineColor?: string;
  };
  getOffStation?: {
    name?: string;
    lineName?: string;
    lineColor?: string;
  };
  completedAt?: string;
  status?: string;
  spentReward?: number;
  remainingReward?: number;
} | null;

export type GetSeatRequestsMeRecentCompletedResponse = {
  boardStation?: {
    name?: string;
    lineName?: string;
    lineColor?: string;
  };
  getOffStation?: {
    name?: string;
    lineName?: string;
    lineColor?: string;
  };
  completedAt?: string;
  status?: string;
  spentReward?: number;
  remainingReward?: number;
} | null;

export type UpdateSeatRequestsRequest = {
  carriages?: number[];
  getOffStationId?: string;
};

export type UpdateSeatRequestsResponse = {
  id?: string;
  trainId?: string;
  boardStationName?: string;
  getOffStationName?: string;
  carriages?: number[];
  status?: 'active' | 'completed' | 'early_exit' | 'cancelled';
  createdAt?: string;
};

export type CancelSeatRequestResponse = Record<string, never>;

export type EarlyExitSeatRequestResponse = Record<string, never>;

export type GetSharesForMyRequestResponse = {
  carriages?: Array<{
    carriage?: number;
    shares?: Array<{
      id?: string;
      boardStationName?: string;
      getOffStationName?: string;
      carriages?: number[];
      stopsAway?: number;
      status?: string;
      appearance?: string | null;
      seatPosition?: number | null;
    }>;
  }>;
};

export type ViewShareDetailResponse = {
  shareId?: string;
  seatPosition?: number;
  appearance?: string;
  rewardBalance?: number;
};

export type GetViewedSharesResponse = {
  upcoming?: Array<{
    shareId?: string;
    boardStationName?: string;
    getOffStationName?: string;
    carriages?: number[];
    seatPosition?: number;
    appearance?: string;
    sharerStatus?: string;
    stopsAway?: number;
    viewedAt?: string;
  }>;
  completed?: Array<{
    shareId?: string;
    boardStationName?: string;
    getOffStationName?: string;
    carriages?: number[];
    seatPosition?: number;
    appearance?: string;
    sharerStatus?: string;
    stopsAway?: number;
    viewedAt?: string;
  }>;
};

/** 개발용 Mock 로그인 */
export async function devLogin(body: DevLoginRequest, opts?: ApiRequestOptions): Promise<DevLoginResponse> {
  return apiFetch('/api/v1/auth/login/dev', { method: 'POST', body, auth: true, ...opts });
}

/** 카카오 OAuth 시작 */
export async function kakaoAuthorize(opts?: ApiRequestOptions): Promise<void> {
  return apiFetch('/api/v1/auth/kakao/authorize', { method: 'GET', auth: true, ...opts });
}

/** 카카오 OAuth 콜백 */
export async function kakaoCallback(query: { code: string }, opts?: ApiRequestOptions): Promise<void> {

  const searchParams = new URLSearchParams();
  searchParams.set('code', String(query.code));
  const qs = searchParams.toString();
  return apiFetch(`/api/v1/auth/kakao/callback${qs ? `?${qs}` : ''}`, { method: 'GET', auth: true, ...opts });
}

/** 소셜 로그인 */
export async function socialLogin(provider: string, body: SocialLoginRequest, opts?: ApiRequestOptions): Promise<SocialLoginResponse> {
  return apiFetch(`/api/v1/auth/login/${provider}`, { method: 'POST', body, auth: true, ...opts });
}

/** 비회원(게스트) 로그인 */
export async function createAuthGuest(body: CreateAuthGuestRequest, opts?: ApiRequestOptions): Promise<CreateAuthGuestResponse> {
  return apiFetch('/api/v1/auth/guest', { method: 'POST', body, auth: true, ...opts });
}

/** 토큰 갱신 */
export async function refreshToken(body: RefreshTokenRequest, opts?: ApiRequestOptions): Promise<RefreshTokenResponse> {
  return apiFetch('/api/v1/auth/refresh', { method: 'POST', body, auth: true, ...opts });
}

/** 로그아웃 */
export async function logout(opts?: ApiRequestOptions): Promise<void> {
  return apiFetch('/api/v1/auth/logout', { method: 'POST', auth: true, ...opts });
}

/** 내 정보 조회 */
export async function getMe(opts?: ApiRequestOptions): Promise<GetMeResponse> {
  return apiFetch('/api/v1/users/me', { method: 'GET', auth: true, ...opts });
}

/** 내 이름 수정 */
export async function updateMyName(body: UpdateMyNameRequest, opts?: ApiRequestOptions): Promise<UpdateMyNameResponse> {
  return apiFetch('/api/v1/users/me', { method: 'PATCH', body, auth: true, ...opts });
}

/** 회원 탈퇴 */
export async function deleteAccount(opts?: ApiRequestOptions): Promise<void> {
  return apiFetch('/api/v1/users/me', { method: 'DELETE', auth: true, ...opts });
}

/** FCM 토큰 등록 */
export async function updateFcmToken(body: UpdateFcmTokenRequest, opts?: ApiRequestOptions): Promise<UpdateFcmTokenResponse> {
  return apiFetch('/api/v1/users/me/fcm-token', { method: 'PUT', body, auth: true, ...opts });
}

/** 리워드 포인트 잔액 조회 */
export async function getUsersMeRewardPoints(opts?: ApiRequestOptions): Promise<GetUsersMeRewardPointsResponse> {
  return apiFetch('/api/v1/users/me/reward-points', { method: 'GET', auth: true, ...opts });
}

/** 리워드 내역 조회 */
export async function getRewards(opts?: ApiRequestOptions): Promise<GetRewardsResponse> {
  return apiFetch('/api/v1/users/me/rewards', { method: 'GET', auth: true, ...opts });
}

/** 출석 체크인 */
export async function checkin(opts?: ApiRequestOptions): Promise<CheckinResponse> {
  return apiFetch('/api/v1/users/me/checkin', { method: 'POST', auth: true, ...opts });
}

/** 광고 시청 리워드 */
export async function claimAdReward(opts?: ApiRequestOptions): Promise<ClaimAdRewardResponse> {
  return apiFetch('/api/v1/users/me/ad-reward', { method: 'POST', auth: true, ...opts });
}

/** 노선 목록 조회 */
export async function getSubwayLines(opts?: ApiRequestOptions): Promise<GetSubwayLinesResponse> {
  return apiFetch('/api/v1/subway/lines', { method: 'GET', auth: true, ...opts });
}

/** 노선별 운행 열차 목록 조회 */
export async function getTrainsByLine(lineId: string, opts?: ApiRequestOptions): Promise<GetTrainsByLineResponse> {
  return apiFetch(`/api/v1/subway/lines/${lineId}/trains`, { method: 'GET', auth: true, ...opts });
}

/** 노선별 역 목록 조회 */
export async function getStationsByLine(lineId: string, opts?: ApiRequestOptions): Promise<GetStationsByLineResponse> {
  return apiFetch(`/api/v1/subway/lines/${lineId}/stations`, { method: 'GET', auth: true, ...opts });
}

/** [디버그] 노선별 운행 열차 상세 조회 */
export async function getTrainsDebug(lineId: string, opts?: ApiRequestOptions): Promise<GetTrainsDebugResponse> {
  return apiFetch(`/api/v1/subway/lines/${lineId}/trains/debug`, { method: 'GET', auth: true, ...opts });
}

/** 역별 열차 목록 조회 */
export async function getTrainsByStation(stationId: string, opts?: ApiRequestOptions): Promise<GetTrainsByStationResponse> {
  return apiFetch(`/api/v1/subway/stations/${stationId}/trains`, { method: 'GET', auth: true, ...opts });
}

/** 자리 공유 등록 */
export async function createSeatShare(body: CreateSeatShareRequest, opts?: ApiRequestOptions): Promise<CreateSeatShareResponse> {
  return apiFetch('/api/v1/seat-shares/', { method: 'POST', body, auth: true, ...opts });
}

/** [DEPRECATED] 내 active 공유 조회 */
export async function getMySeatShare(opts?: ApiRequestOptions): Promise<GetMySeatShareResponse> {
  return apiFetch('/api/v1/seat-shares/me', { method: 'GET', auth: true, ...opts });
}

/** 자리 공유 여정 상태 통합 조회(폴링용) */
export async function getSeatSharesMeStatus(opts?: ApiRequestOptions): Promise<GetSeatSharesMeStatusResponse> {
  return apiFetch('/api/v1/seat-shares/me/status', { method: 'GET', auth: true, ...opts });
}

/** [DEPRECATED] 최근 완료된 자리 공유 여정 조회(소비형) */
export async function getSeatSharesMeLatestCompleted(opts?: ApiRequestOptions): Promise<GetSeatSharesMeLatestCompletedResponse> {
  return apiFetch('/api/v1/seat-shares/me/latest-completed', { method: 'GET', auth: true, ...opts });
}

/** 최근 완료된 자리 공유 여정 다시보기(비소비형) */
export async function getSeatSharesMeRecentCompleted(opts?: ApiRequestOptions): Promise<GetSeatSharesMeRecentCompletedResponse> {
  return apiFetch('/api/v1/seat-shares/me/recent-completed', { method: 'GET', auth: true, ...opts });
}

/** 자리 공유 정보 수정 */
export async function updateSeatShares(shareId: string, body: UpdateSeatSharesRequest, opts?: ApiRequestOptions): Promise<UpdateSeatSharesResponse> {
  return apiFetch(`/api/v1/seat-shares/${shareId}`, { method: 'PATCH', body, auth: true, ...opts });
}

/** 자리 공유 취소 */
export async function cancelSeatShare(shareId: string, opts?: ApiRequestOptions): Promise<CancelSeatShareResponse> {
  return apiFetch(`/api/v1/seat-shares/${shareId}`, { method: 'DELETE', auth: true, ...opts });
}

/** 먼저 내림 처리 */
export async function earlyExitSeatShare(shareId: string, opts?: ApiRequestOptions): Promise<EarlyExitSeatShareResponse> {
  return apiFetch(`/api/v1/seat-shares/${shareId}/early-exit`, { method: 'POST', auth: true, ...opts });
}

/** 착석 희망 등록 */
export async function createSeatRequest(body: CreateSeatRequestRequest, opts?: ApiRequestOptions): Promise<CreateSeatRequestResponse> {
  return apiFetch('/api/v1/seat-requests/', { method: 'POST', body, auth: true, ...opts });
}

/** [DEPRECATED] active 착석 희망 조회 */
export async function getMySeatRequest(opts?: ApiRequestOptions): Promise<GetMySeatRequestResponse> {
  return apiFetch('/api/v1/seat-requests/me', { method: 'GET', auth: true, ...opts });
}

/** 착석 희망 여정 상태 통합 조회(폴링용) */
export async function getSeatRequestsMeStatus(opts?: ApiRequestOptions): Promise<GetSeatRequestsMeStatusResponse> {
  return apiFetch('/api/v1/seat-requests/me/status', { method: 'GET', auth: true, ...opts });
}

/** [DEPRECATED] 최근 완료된 착석 희망 여정 조회(소비형) */
export async function getSeatRequestsMeLatestCompleted(opts?: ApiRequestOptions): Promise<GetSeatRequestsMeLatestCompletedResponse> {
  return apiFetch('/api/v1/seat-requests/me/latest-completed', { method: 'GET', auth: true, ...opts });
}

/** 최근 완료된 착석 희망 여정 다시보기(비소비형) */
export async function getSeatRequestsMeRecentCompleted(opts?: ApiRequestOptions): Promise<GetSeatRequestsMeRecentCompletedResponse> {
  return apiFetch('/api/v1/seat-requests/me/recent-completed', { method: 'GET', auth: true, ...opts });
}

/** 착석 희망 정보 수정 */
export async function updateSeatRequests(requestId: string, body: UpdateSeatRequestsRequest, opts?: ApiRequestOptions): Promise<UpdateSeatRequestsResponse> {
  return apiFetch(`/api/v1/seat-requests/${requestId}`, { method: 'PATCH', body, auth: true, ...opts });
}

/** 착석 희망 취소 */
export async function cancelSeatRequest(requestId: string, opts?: ApiRequestOptions): Promise<CancelSeatRequestResponse> {
  return apiFetch(`/api/v1/seat-requests/${requestId}`, { method: 'DELETE', auth: true, ...opts });
}

/** 착석 희망 먼저내림 처리 */
export async function earlyExitSeatRequest(requestId: string, opts?: ApiRequestOptions): Promise<EarlyExitSeatRequestResponse> {
  return apiFetch(`/api/v1/seat-requests/${requestId}/early-exit`, { method: 'POST', auth: true, ...opts });
}

/** 내 요청 기준 하차 예정자 목록 조회 */
export async function getSharesForMyRequest(query: { carriage?: number }, opts?: ApiRequestOptions): Promise<GetSharesForMyRequestResponse> {

  const searchParams = new URLSearchParams();
  if (query.carriage != null) searchParams.set('carriage', String(query.carriage));
  const qs = searchParams.toString();
  return apiFetch(`/api/v1/seat-requests/me/shares${qs ? `?${qs}` : ''}`, { method: 'GET', auth: true, ...opts });
}

/** 하차 예정자 상세 열람 */
export async function viewShareDetail(shareId: string, opts?: ApiRequestOptions): Promise<ViewShareDetailResponse> {
  return apiFetch(`/api/v1/seat-requests/me/shares/${shareId}/view`, { method: 'POST', auth: true, ...opts });
}

/** 열람한 하차 예정자 목록 조회 */
export async function getViewedShares(opts?: ApiRequestOptions): Promise<GetViewedSharesResponse> {
  return apiFetch('/api/v1/seat-requests/me/viewed', { method: 'GET', auth: true, ...opts });
}
