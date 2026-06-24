// ──────────────────────────────────────────────────────
// 전역 API 에러 버스
// apiFetch(순수 모듈)가 에러를 발행하고, UI 레이어(ToastProvider)가 구독한다.
// ──────────────────────────────────────────────────────

import type { ApiError } from './client';

type Listener = (err: ApiError) => void;

const listeners = new Set<Listener>();

export const errorBus = {
  /** 에러를 모든 구독자에게 동기적으로 전달한다. */
  emit(err: ApiError) {
    listeners.forEach((listener) => listener(err));
  },
  /** 구독을 등록하고, 해제 함수를 반환한다. */
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
