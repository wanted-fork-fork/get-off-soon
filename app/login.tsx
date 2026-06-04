import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/constants/theme';
import BrandGoogle from '../assets/icons/BrandGoogle.svg';
import BrandApple from '../assets/icons/BrandApple.svg';
import BrandKakao from '../assets/icons/BrandKakao.svg';
import { signInWithKakao, KakaoAuthError } from '../src/api/kakaoAuth';
import { signInWithDev } from '../src/api/tokenStore';
import { ApiError } from '../src/api/client';

const KAKAO_YELLOW = '#FEE500';

interface SocialButtonProps {
  icon: React.ReactNode;
  label: string;
  background: string;
  textColor: string;
  onPress: () => void;
  disabled?: boolean;
}

function SocialButton({ icon, label, background, textColor, onPress, disabled }: SocialButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      style={{
        height: 44,
        borderRadius: 99,
        backgroundColor: background,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <View style={{ width: 22, height: 22, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
        {icon}
      </View>
      <Text style={{ color: textColor, fontSize: 15, fontWeight: '600', letterSpacing: 15 * -0.015 }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState<'kakao' | 'google' | 'apple' | null>(null);

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/' as any);
    }
  };

  const handleGoogle = async () => {
    if (submitting) return;
    setSubmitting('google');
    try {
      await signInWithDev();
      router.replace('/' as any);
    } catch (err) {
      if (err instanceof ApiError) {
        Alert.alert('로그인 실패', err.message);
      } else {
        Alert.alert('로그인 실패', '잠시 후 다시 시도해주세요.');
      }
    } finally {
      setSubmitting(null);
    }
  };

  const handleKakao = async () => {
    if (submitting) return;
    setSubmitting('kakao');
    try {
      await signInWithKakao();
      router.replace('/' as any);
    } catch (err) {
      if (err instanceof KakaoAuthError) {
        Alert.alert('로그인 실패', err.message);
      } else if (err instanceof ApiError) {
        Alert.alert('로그인 실패', err.message);
      } else {
        Alert.alert('로그인 실패', '잠시 후 다시 시도해주세요.');
      }
    } finally {
      setSubmitting(null);
    }
  };

  const handleApple = () => {
    // TODO: Apple Sign in
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.DEFAULT }} edges={['top', 'bottom']}>
      <View style={{ height: 56, paddingHorizontal: 16, justifyContent: 'center' }}>
        <TouchableOpacity
          onPress={handleClose}
          hitSlop={12}
          style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: colors.fg.DEFAULT, fontSize: 22, lineHeight: 24 }}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
        <Text
          style={{
            fontFamily: 'Paperlogy-ExtraBold',
            fontSize: 44,
            color: colors.fg.DEFAULT,
            letterSpacing: -1,
            marginBottom: 24,
          }}
        >
          곧 내려요
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: colors.fg.secondary,
            textAlign: 'center',
            lineHeight: 24,
            fontWeight: '400',
          }}
        >
          {'지하철에서 자리 눈치게임은\n이제 그만!'}
        </Text>
      </View>

      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.divider }} />
          <Text
            style={{
              color: '#E4E5E7',
              fontSize: 16,
              fontWeight: '600',
              lineHeight: 24,
              letterSpacing: 16 * -0.015,
              marginHorizontal: 12,
            }}
          >
            간편 로그인
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.divider }} />
        </View>

        <View style={{ gap: 12 }}>
          <SocialButton
            icon={<BrandGoogle width={18} height={18} />}
            label={submitting === 'google' ? '로그인 중...' : 'Google로 시작하기'}
            background="#FFFFFF"
            textColor="#000000"
            onPress={handleGoogle}
            disabled={submitting !== null}
          />
          <SocialButton
            icon={<BrandKakao width={18} height={18} />}
            label={submitting === 'kakao' ? '카카오 로그인 중...' : '카카오톡으로 시작하기'}
            background={KAKAO_YELLOW}
            textColor="#000000"
            onPress={handleKakao}
            disabled={submitting !== null}
          />
          <SocialButton
            icon={<BrandApple width={18} height={18} />}
            label="Apple로 계속하기"
            background="#FFFFFF"
            textColor="#000000"
            onPress={handleApple}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
