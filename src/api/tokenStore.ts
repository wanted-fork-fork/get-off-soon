import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Application from 'expo-application';
import CryptoJS from 'crypto-js';
import { setTokenStore } from './client';
import { createAuthGuest } from './generated';

const ACCESS_KEY = 'auth.accessToken';
const REFRESH_KEY = 'auth.refreshToken';
const DEVICE_ID_KEY = 'auth.deviceId';

const GUEST_SIGNING_SECRET = process.env.EXPO_PUBLIC_GUEST_AUTH_SECRET ?? '';

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

/**
 * 게스트 로그인에 사용할 기기 식별자를 구한다.
 * 네이티브(android id / iOS idForVendor)를 우선 사용하고,
 * 웹이거나 구할 수 없으면 한 번 생성해 영구 저장한 값(웹은 localStorage)을 재사용한다.
 */
async function resolveDeviceId(): Promise<string> {
  // 웹은 네이티브 기기값이 없으므로 저장된 UUID를 사용한다.
  if (Platform.OS !== 'web') {
    try {
      const nativeId =
        Platform.OS === 'android'
          ? Application.getAndroidId()
          : await Application.getIosIdForVendorAsync();
      if (nativeId) return nativeId;
    } catch {
      // 네이티브 식별자 조회 실패 시 저장된 값으로 폴백
    }
  }

  let stored = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (!stored) {
    stored = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
    await AsyncStorage.setItem(DEVICE_ID_KEY, stored);
  }
  return stored;
}

let bootstrapPromise: Promise<void> | null = null;

export function bootstrapAuth(): Promise<void> {
  if (bootstrapPromise) return bootstrapPromise;
  bootstrapPromise = (async () => {
    setTokenStore(asyncStorageTokenStore);
    // 저장된 토큰이 없으면 자동으로 게스트 로그인한다. (최초 실행)
    const existing = await asyncStorageTokenStore.getAccessToken();
    if (!existing) {
      await signInAsGuest();
    }
  })();
  return bootstrapPromise;
}

/** 로그아웃·탈퇴 후 토큰을 비운다. 이후에는 비로그인(게스트) 상태가 된다. */
export async function resetAuth(): Promise<void> {
  await asyncStorageTokenStore.clearTokens();
}

/**
 * 비회원(게스트) 로그인 — 기기값으로 HMAC-SHA256 서명을 만들어 토큰을 발급받아 저장한다.
 * 신규 기기는 백엔드에서 자동으로 게스트 계정이 생성된다.
 */
export async function signInAsGuest(name?: string): Promise<void> {
  if (!GUEST_SIGNING_SECRET) {
    throw new Error('EXPO_PUBLIC_GUEST_AUTH_SECRET 가 설정되지 않았습니다.');
  }

  const deviceId = await resolveDeviceId();
  const timestamp = Date.now();
  const signature = CryptoJS.HmacSHA256(
    `${deviceId}.${timestamp}`,
    GUEST_SIGNING_SECRET,
  ).toString(CryptoJS.enc.Hex);

  const res = await createAuthGuest({
    deviceId,
    timestamp,
    signature,
    ...(name ? { name } : {}),
  });
  if (!res.accessToken) throw new Error('게스트 로그인: accessToken 누락');
  await asyncStorageTokenStore.setTokens(res.accessToken, res.refreshToken);
  console.log(
    '[auth] 게스트 로그인 완료:',
    JSON.stringify({ deviceId, user: res.user }, null, 2),
  );
}
