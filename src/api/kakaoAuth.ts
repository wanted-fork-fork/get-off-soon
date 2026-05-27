import {
  login as kakaoLogin,
  logout as kakaoLogout,
  isKakaoTalkLoginAvailable,
} from '@react-native-kakao/user';
import { socialLogin } from './generated';
import { persistAuthTokens } from './tokenStore';

export class KakaoAuthError extends Error {
  cause?: unknown;
  code?: string;
  constructor(message: string, opts?: { cause?: unknown; code?: string }) {
    super(message);
    this.name = 'KakaoAuthError';
    this.cause = opts?.cause;
    this.code = opts?.code;
  }
}

function describeKakaoError(err: unknown): { message: string; code?: string } {
  if (err && typeof err === 'object') {
    const anyErr = err as { message?: unknown; code?: unknown };
    const code = typeof anyErr.code === 'string' ? anyErr.code : undefined;
    const raw = typeof anyErr.message === 'string' ? anyErr.message : '';
    const codeSuffix = code ? ` [${code}]` : '';
    return { message: `카카오 로그인 실패: ${raw || '알 수 없는 오류'}${codeSuffix}`, code };
  }
  return { message: '카카오 로그인에 실패했습니다.' };
}

/**
 * 카카오 SDK로 access token을 얻고 백엔드 /api/v1/auth/login/kakao 에 전달해
 * 서비스 토큰을 발급받아 로컬 저장소에 저장한다.
 */
export async function signInWithKakao(): Promise<void> {
  console.log('[kakaoAuth] start');

  let useAccountLogin = true;
  try {
    useAccountLogin = !(await isKakaoTalkLoginAvailable());
  } catch (err) {
    console.warn('[kakaoAuth] isKakaoTalkLoginAvailable failed, fallback to account login', err);
  }
  console.log('[kakaoAuth] login mode:', useAccountLogin ? 'kakao-account-web' : 'kakaotalk');

  let kakaoAccessToken: string;
  try {
    const token = await kakaoLogin({ useKakaoAccountLogin: useAccountLogin });
    console.log('[kakaoAuth] kakao token received, length=', token.accessToken?.length);
    kakaoAccessToken = token.accessToken;
  } catch (err) {
    console.warn('[kakaoAuth] kakaoLogin failed', err);
    const { message, code } = describeKakaoError(err);
    throw new KakaoAuthError(message, { cause: err, code });
  }

  console.log('[kakaoAuth] calling backend socialLogin(kakao)');
  let res;
  try {
    res = await socialLogin('kakao', { accessToken: kakaoAccessToken });
  } catch (err) {
    console.warn('[kakaoAuth] backend socialLogin failed', err);
    throw err;
  }
  console.log('[kakaoAuth] backend response received, hasAccessToken=', Boolean(res.accessToken));

  if (!res.accessToken) {
    try {
      await kakaoLogout();
    } catch {
      // ignore
    }
    throw new KakaoAuthError('서비스 토큰 발급에 실패했습니다.');
  }

  await persistAuthTokens(res.accessToken, res.refreshToken);
  console.log('[kakaoAuth] tokens persisted');
}
