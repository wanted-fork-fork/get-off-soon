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
  let useAccountLogin = true;
  try {
    useAccountLogin = !(await isKakaoTalkLoginAvailable());
  } catch {
    // 톡 가용성 확인 실패 시 안전하게 계정 로그인 사용
  }

  let kakaoAccessToken: string;
  try {
    const token = await kakaoLogin({ useKakaoAccountLogin: useAccountLogin });
    kakaoAccessToken = token.accessToken;
  } catch (err) {
    const { message, code } = describeKakaoError(err);
    throw new KakaoAuthError(message, { cause: err, code });
  }

  const res = await socialLogin('kakao', { accessToken: kakaoAccessToken });
  if (!res.accessToken) {
    try {
      await kakaoLogout();
    } catch {
      // ignore
    }
    throw new KakaoAuthError('서비스 토큰 발급에 실패했습니다.');
  }

  await persistAuthTokens(res.accessToken, res.refreshToken);
}
