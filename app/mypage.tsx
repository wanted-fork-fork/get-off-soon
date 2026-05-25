import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ImageSourcePropType, Modal, Alert, Linking } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/constants/theme';
import { TopBar } from '../src/components/ui/TopBar';
import { getMe, logout } from '../src/api/generated';
import { resetAuth } from '../src/api/tokenStore';
import { ApiError } from '../src/api/client';
import { useJourney } from '../src/context/JourneyContext';

const GUEST_PROVIDERS = new Set(['dev', 'guest', 'anonymous', '']);

const EXTERNAL_LINKS = {
  faq: 'https://www.notion.so/36b92f26cef7802b8e7feaf09ca2bc52',
  inquiry: 'https://forms.gle/wJhUwM4fL9o5HdiT6',
  terms: 'https://www.notion.so/36b92f26cef7803dbc47cd6205f43fc7',
  privacy: 'https://www.notion.so/36b92f26cef780d3a5aff5e3db2982de',
  geo: 'https://www.notion.so/36b92f26cef7805dba3aecc2aecff09d',
} as const;

async function openExternalLink(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('링크를 열 수 없습니다.');
  }
}

function isSocialProvider(provider: string | undefined | null): boolean {
  if (!provider) return false;
  return !GUEST_PROVIDERS.has(provider.toLowerCase());
}

const ICONS = {
  rewords: require('../assets/icons/rewords.png'),
  ads: require('../assets/icons/ads.png'),
  faq: require('../assets/icons/faq.png'),
  question: require('../assets/icons/question.png'),
  terms: require('../assets/icons/terms.png'),
  geo: require('../assets/icons/geo.png'),
};

const sectionTitleStyle = {
  color: colors.fg.DEFAULT,
  fontSize: 16,
  fontWeight: '600' as const,
  lineHeight: 16,
  letterSpacing: 16 * -0.015,
};

const menuTitleStyle = {
  color: colors.fg.DEFAULT,
  fontSize: 16,
  fontWeight: '500' as const,
  lineHeight: 16,
  letterSpacing: 16 * -0.015,
};

const footerActionStyle = {
  color: colors.fg.DEFAULT,
  fontSize: 16,
  fontWeight: '600' as const,
  lineHeight: 16,
  letterSpacing: 16 * -0.015,
};

interface MenuRowProps {
  icon: ImageSourcePropType;
  label: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
}

function MenuRow({ icon, label, trailing, onPress }: MenuRowProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
      }}
    >
      <Image source={icon} style={{ width: 24, height: 24, marginRight: 12 }} resizeMode="contain" />
      <Text style={[menuTitleStyle, { flex: 1 }]}>{label}</Text>
      {trailing}
    </TouchableOpacity>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text style={[sectionTitleStyle, { marginBottom: 12 }]}>
      {children}
    </Text>
  );
}

export default function MyPageScreen() {
  const router = useRouter();
  const { reset: resetJourney } = useJourney();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  const refreshAuthStatus = React.useCallback(async () => {
    try {
      const me = await getMe();
      setLoggedIn(isSocialProvider(me.provider));
    } catch (err) {
      if (err instanceof ApiError) {
        setLoggedIn(false);
        return;
      }
      setLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    refreshAuthStatus();
  }, [refreshAuthStatus]);

  useFocusEffect(
    React.useCallback(() => {
      refreshAuthStatus();
    }, [refreshAuthStatus])
  );

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
    } catch (err) {
      if (!(err instanceof ApiError)) {
        Alert.alert('로그아웃 실패', '잠시 후 다시 시도해주세요.');
        setLoggingOut(false);
        return;
      }
    }
    try {
      await resetAuth();
      resetJourney();
      setLogoutOpen(false);
      router.replace('/' as any);
    } catch {
      Alert.alert('로그아웃 실패', '잠시 후 다시 시도해주세요.');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.DEFAULT }} edges={['top']}>
      <TopBar variant="back" title="마이페이지" onBack={() => router.back()} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {loggedIn === false && (
          <LoginBanner onPress={() => router.push('/login' as any)} />
        )}

        {/* 이동 및 리워드 */}
        <View style={{ marginBottom: 32 }}>
          <SectionTitle>이동 및 리워드</SectionTitle>
          <MenuRow
            icon={ICONS.rewords}
            label="리워드 내역"
            onPress={() => router.push('/reward-history' as any)}
            trailing={
              <Text style={{ color: colors.fg.muted, fontSize: 13, fontWeight: '400', letterSpacing: 13 * -0.015 }}>
                획득 사용 기록
              </Text>
            }
          />
          <MenuRow icon={ICONS.ads} label="광고 시청하고 1 리워드 얻기" />
        </View>

        {/* 고객지원 */}
        <View style={{ marginBottom: 32 }}>
          <SectionTitle>고객지원</SectionTitle>
          <MenuRow icon={ICONS.faq} label="자주 묻는 질문" onPress={() => openExternalLink(EXTERNAL_LINKS.faq)} />
          <MenuRow icon={ICONS.question} label="문의하기" onPress={() => openExternalLink(EXTERNAL_LINKS.inquiry)} />
        </View>

        {/* 약관 및 정책 */}
        <View style={{ marginBottom: 32 }}>
          <SectionTitle>약관 및 정책</SectionTitle>
          <MenuRow icon={ICONS.terms} label="서비스 이용약관" onPress={() => openExternalLink(EXTERNAL_LINKS.terms)} />
          <MenuRow icon={ICONS.terms} label="개인정보 처리방침" onPress={() => openExternalLink(EXTERNAL_LINKS.privacy)} />
          <MenuRow icon={ICONS.geo} label="위치정보 이용약관" onPress={() => openExternalLink(EXTERNAL_LINKS.geo)} />
        </View>

        {/* 로그아웃 / 회원 탈퇴 — 로그인 상태에서만 노출 */}
        {loggedIn === true && (
          <>
            <TouchableOpacity activeOpacity={0.7} style={{ paddingVertical: 14 }} onPress={() => setLogoutOpen(true)}>
              <Text style={footerActionStyle}>로그아웃</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} style={{ paddingVertical: 14 }} onPress={() => router.push('/withdraw' as any)}>
              <Text style={footerActionStyle}>회원 탈퇴</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <LogoutConfirmModal
        visible={logoutOpen}
        loading={loggingOut}
        onCancel={() => !loggingOut && setLogoutOpen(false)}
        onConfirm={handleLogout}
      />
    </SafeAreaView>
  );
}

function LoginBanner({ onPress }: { onPress: () => void }) {
  return (
    <View
      style={{
        backgroundColor: colors.surface.card,
        borderRadius: 14,
        paddingHorizontal: 18,
        paddingVertical: 18,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: colors.fg.DEFAULT,
            fontSize: 16,
            fontWeight: '600',
            lineHeight: 16 * 1.3,
            letterSpacing: 16 * -0.015,
          }}
        >
          로그인하고 편히 앉아가세요.
        </Text>
        <Text
          style={{
            color: colors.fg.muted,
            fontSize: 13,
            fontWeight: '400',
            marginTop: 6,
            letterSpacing: 13 * -0.015,
          }}
        >
          가입 시 2 리워드 즉시 적립
        </Text>
      </View>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={{
          marginLeft: 12,
          backgroundColor: colors.accent.blue,
          borderRadius: 8,
          paddingHorizontal: 14,
          paddingVertical: 8,
        }}
      >
        <Text style={{ color: colors.fg.onAccent, fontSize: 13, fontWeight: '600', letterSpacing: 13 * -0.015 }}>
          로그인
        </Text>
      </TouchableOpacity>
    </View>
  );
}

interface LogoutConfirmModalProps {
  visible: boolean;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function LogoutConfirmModal({ visible, loading, onCancel, onConfirm }: LogoutConfirmModalProps) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.6)',
          justifyContent: 'center',
          paddingHorizontal: 32,
        }}
      >
        <View
          style={{
            backgroundColor: colors.surface.card,
            borderRadius: 16,
            padding: 20,
          }}
        >
          <Text style={{ color: colors.fg.DEFAULT, fontSize: 18, fontWeight: '600', letterSpacing: 18 * -0.015 }}>
            로그아웃
          </Text>
          <Text style={{ color: colors.fg.secondary, fontSize: 14, fontWeight: '400', marginTop: 8, marginBottom: 20, letterSpacing: 14 * -0.015 }}>
            정말 로그아웃할까요?
          </Text>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onCancel}
              disabled={loading}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#737B8C',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: loading ? 0.5 : 1,
              }}
            >
              <Text style={{ color: '#737B8C', fontSize: 15, fontWeight: '500' }}>닫기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onConfirm}
              disabled={loading}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 10,
                backgroundColor: colors.accent.blue,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: loading ? 0.6 : 1,
              }}
            >
              <Text style={{ color: colors.fg.onAccent, fontSize: 15, fontWeight: '600' }}>로그아웃</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
