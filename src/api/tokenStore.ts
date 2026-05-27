import AsyncStorage from '@react-native-async-storage/async-storage';
import { setTokenStore } from './client';
import { devLogin } from './generated';

const ACCESS_KEY = 'auth.accessToken';
const REFRESH_KEY = 'auth.refreshToken';

const asyncStorageTokenStore = {
  async getAccessToken() {
    return AsyncStorage.getItem(ACCESS_KEY);
  },
  async getRefreshToken() {
    return AsyncStorage.getItem(REFRESH_KEY);
  },
  async setTokens(access: string, refresh?: string) {
    await AsyncStorage.setItem(ACCESS_KEY, access);
    if (refresh) await AsyncStorage.setItem(REFRESH_KEY, refresh);
  },
  async clearTokens() {
    await AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY]);
  },
};

let bootstrapPromise: Promise<void> | null = null;

export function bootstrapAuth(): Promise<void> {
  if (bootstrapPromise) return bootstrapPromise;
  bootstrapPromise = (async () => {
    setTokenStore(asyncStorageTokenStore);

    const access = await asyncStorageTokenStore.getAccessToken();
    if (access) return;

    const res = await devLogin({});
    if (!res.accessToken) throw new Error('devLogin: accessToken missing');
    await asyncStorageTokenStore.setTokens(res.accessToken, res.refreshToken);
  })();
  return bootstrapPromise;
}

/** 로그아웃·탈퇴 후 토큰을 비우고 다음 bootstrap에서 dev 로그인이 다시 일어나도록 한다. */
export async function resetAuth(): Promise<void> {
  await asyncStorageTokenStore.clearTokens();
  bootstrapPromise = null;
  await bootstrapAuth();
}

/** 소셜 로그인 응답을 저장 — 이후 bootstrap이 재실행되더라도 저장된 토큰을 사용한다. */
export async function persistAuthTokens(access: string, refresh?: string): Promise<void> {
  await asyncStorageTokenStore.setTokens(access, refresh);
}
