import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/constants/theme';
import BrandGoogle from '../assets/icons/BrandGoogle.svg';
import BrandApple from '../assets/icons/BrandApple.svg';
import BrandKakao from '../assets/icons/BrandKakao.svg';

const KAKAO_YELLOW = '#FEE500';

export default function LoginScreen() {
  const router = useRouter();

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/' as any);
    }
  };

  const handleGoogle = () => {
    // TODO: Google OAuth
  };

  const handleKakao = () => {
    // TODO: Kakao OAuth
  };

  const handleApple = () => {
    // TODO: Apple Sign in
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={handleClose} hitSlop={12} style={styles.closeBtn}>
          <Text style={styles.closeIcon}>✕</Text>
        </Pressable>
      </View>

      <View style={styles.hero}>
        <Text style={styles.brand}>곧 내려요</Text>
        <Text style={styles.tagline}>{'지하철에서 자리 눈치게임은\n이제 그만!'}</Text>
      </View>

      <View style={styles.bottom}>
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerLabel}>간편 로그인</Text>
          <View style={styles.dividerLine} />
        </View>

        <Pressable
          onPress={handleGoogle}
          style={({ pressed }) => [
            styles.btn,
            styles.btnWhite,
            pressed && { opacity: 0.85 },
          ]}
        >
          <View style={styles.iconWrap}>
            <BrandGoogle width={18} height={18} />
          </View>
          <Text style={styles.btnLabelDark}>Google로 시작하기</Text>
        </Pressable>

        <Pressable
          onPress={handleKakao}
          style={({ pressed }) => [
            styles.btn,
            { backgroundColor: KAKAO_YELLOW },
            pressed && { opacity: 0.85 },
          ]}
        >
          <View style={styles.iconWrap}>
            <BrandKakao width={18} height={18} />
          </View>
          <Text style={styles.btnLabelDark}>카카오톡으로 시작하기</Text>
        </Pressable>

        <Pressable
          onPress={handleApple}
          style={({ pressed }) => [
            styles.btn,
            styles.btnWhite,
            pressed && { opacity: 0.85 },
          ]}
        >
          <View style={styles.iconWrap}>
            <BrandApple width={18} height={18} />
          </View>
          <Text style={styles.btnLabelDark}>Apple로 계속하기</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface.DEFAULT,
  },
  header: {
    height: 56,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    color: colors.fg.DEFAULT,
    fontSize: 22,
    fontWeight: '400',
    lineHeight: 24,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  brand: {
    fontFamily: 'Paperlogy-ExtraBold',
    fontSize: 44,
    color: colors.fg.DEFAULT,
    letterSpacing: -1,
    marginBottom: 24,
  },
  tagline: {
    fontSize: 16,
    color: colors.fg.secondary,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
  },
  bottom: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 10,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  dividerLabel: {
    color: colors.fg.muted,
    fontSize: 13,
    fontWeight: '500',
  },
  btn: {
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  btnWhite: {
    backgroundColor: '#FFFFFF',
  },
  iconWrap: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  btnLabelDark: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '600',
  },
});
