// ──────────────────────────────────────────────────────
// ApiError → 사용자용 한글 안내 메시지 매핑 (단일 출처)
// ──────────────────────────────────────────────────────

import type { ApiError } from './client';

const DEFAULT_MESSAGE = '오류가 발생했어요. 잠시 후 다시 시도해주세요.';

export function toUserMessage(err: ApiError): string {
  if (err.code === 'RATE_LIMITED' || err.statusCode === 429) {
    return '요청이 많아요. 잠시 후 다시 시도해주세요.';
  }
  if (err.code === 'NETWORK' || err.statusCode === 0) {
    return '네트워크 연결을 확인해주세요.';
  }
  if (err.statusCode >= 500) {
    return '일시적인 오류예요. 잠시 후 다시 시도해주세요.';
  }
  return err.message?.trim() || DEFAULT_MESSAGE;
}
