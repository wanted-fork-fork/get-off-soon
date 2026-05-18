import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/constants/theme';
import { TopBar } from '../src/components/ui/TopBar';

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.DEFAULT }} edges={['top']}>
      <TopBar variant="back" title="마이페이지" onBack={() => router.back()} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
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
          <MenuRow icon={ICONS.faq} label="자주 묻는 질문" />
          <MenuRow icon={ICONS.question} label="문의하기" />
        </View>

        {/* 약관 및 정책 */}
        <View style={{ marginBottom: 32 }}>
          <SectionTitle>약관 및 정책</SectionTitle>
          <MenuRow icon={ICONS.terms} label="서비스 이용약관" />
          <MenuRow icon={ICONS.terms} label="개인정보 처리방침" />
          <MenuRow icon={ICONS.geo} label="위치정보 이용약관" />
        </View>

        {/* 로그아웃 / 회원 탈퇴 */}
        <TouchableOpacity activeOpacity={0.7} style={{ paddingVertical: 14 }}>
          <Text style={footerActionStyle}>로그아웃</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.7} style={{ paddingVertical: 14 }}>
          <Text style={footerActionStyle}>회원 탈퇴</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
