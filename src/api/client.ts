// ──────────────────────────────────────────────────────
// API 클라이언트 — 토큰 관리 및 자동 갱신 포함
// ──────────────────────────────────────────────────────

import { errorBus } from './errorBus';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;

// 429 재시도 정책
const MAX_RETRIES_429 = 3;
const BACKOFF_BASE_MS = 500; // 0.5s → 1s → 2s
const BACKOFF_CAP_MS = 10_000;

type TokenStore = {
  getAccessToken: () => Promise<string | null>;
  getRefreshToken: () => Promise<string | null>;
  setTokens: (access: string, refresh?: string) => Promise<void>;
  clearTokens: () => Promise<void>;
};

let tokenStore: TokenStore | null = null;

export function setTokenStore(store: TokenStore) {
  tokenStore = store;
}

export class ApiError extends Error {
  code: string;
  statusCode: number;

  constructor(code: string, message: string, statusCode: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

type FetchOptions = {
  method: string;
  body?: unknown;
  auth?: boolean;
  /** true면 에러를 errorBus로 발행하지 않는다(토스트 미노출). 재시도·정규화는 영향 없음. */
  silent?: boolean;
};

/** 생성된 API 래퍼가 마지막 인자로 받는, 호출자용 옵션. */
export type ApiRequestOptions = { silent?: boolean };

/** 429 응답의 Retry-After(초 또는 HTTP-date)를 ms로 해석한다. 없으면 null. */
function parseRetryAfter(header: string | null): number | null {
  if (!header) return null;
  const seconds = Number(header);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const dateMs = Date.parse(header);
  if (Number.isFinite(dateMs)) return Math.max(0, dateMs - Date.now());
  return null;
}

/** attempt(0-base)에 따른 지수 백오프(±20% 지터, 상한 적용). */
function backoffDelay(attempt: number): number {
  const base = BACKOFF_BASE_MS * 2 ** attempt;
  const jitter = base * 0.2 * (Math.random() * 2 - 1);
  return Math.min(BACKOFF_CAP_MS, Math.round(base + jitter));
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function tryRefresh(): Promise<string | null> {
  if (!tokenStore) return null;

  if (isRefreshing && refreshPromise) return refreshPromise;

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = await tokenStore!.getRefreshToken();
      if (!refreshToken) return null;

      const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) return null;

      const data = await res.json();
      await tokenStore!.setTokens(data.accessToken);
      return data.accessToken as string;
    } catch {
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function requestWithRetry<T>(path: string, options: FetchOptions): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.auth && tokenStore) {
    const token = await tokenStore.getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const doFetch = () =>
    fetch(`${BASE_URL}${path}`, {
      method: options.method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

  let res = await doFetch();

  // 401 → 토큰 갱신 후 재시도
  if (res.status === 401 && options.auth && tokenStore) {
    const newToken = await tryRefresh();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await doFetch();
    }
  }

  // 429 → Retry-After / 지수 백오프로 최대 MAX_RETRIES_429회 재시도
  for (let attempt = 0; res.status === 429 && attempt < MAX_RETRIES_429; attempt++) {
    const retryAfter = parseRetryAfter(res.headers.get('Retry-After'));
    const delay =
      retryAfter != null ? Math.min(BACKOFF_CAP_MS, retryAfter) : backoffDelay(attempt);
    await sleep(delay);
    res = await doFetch();
  }

  if (res.status === 204) return undefined as T;

  if (res.status === 429) {
    throw new ApiError('RATE_LIMITED', '요청이 많습니다. 잠시 후 다시 시도해주세요.', 429);
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const err = data?.error;
    throw new ApiError(
      err?.code ?? 'UNKNOWN',
      err?.message ?? 'Unknown error',
      err?.statusCode ?? res.status,
    );
  }

  return (await res.json()) as T;
}

export async function apiFetch<T>(path: string, options: FetchOptions): Promise<T> {
  try {
    return await requestWithRetry<T>(path, options);
  } catch (err) {
    // ApiError가 아니면(fetch 자체 실패 등) 네트워크 에러로 정규화한다.
    const apiError =
      err instanceof ApiError
        ? err
        : new ApiError('NETWORK', '네트워크 연결을 확인해주세요.', 0);
    // silent가 아니고 401(토큰 갱신으로 처리)이 아니면 전역 안내를 위해 발행한다.
    if (!options.silent && apiError.statusCode !== 401) {
      errorBus.emit(apiError);
    }
    throw apiError;
  }
}
