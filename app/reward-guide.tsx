import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/constants/theme';
import { TopBar } from '../src/components/ui/TopBar';

interface GuideItem {
  label: string;
  amount: number;
}

const EARN_ITEMS: GuideItem[] = [
  { label: '회원 가입 시', amount: 10 },
  { label: '출석체크 (하루 1회)', amount: 10 },
  { label: '좌석 공유 등록', amount: 5 },
];

const SPEND_ITEMS: GuideItem[] = [
  { label: '좌석 상세 열람', amount: -1 },
];

function formatAmount(amount: number): string {
  return amount > 0 ? `+${amount}` : `${amount}`;
}

function GuideRow({ item }: { item: GuideItem }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
      }}
    >
      <Text style={{ color: colors.fg.secondary, fontSize: 16, letterSpacing: 16 * -0.015 }}>
        {item.label}
      </Text>
      <Text
        style={{
          color: colors.fg.DEFAULT,
          fontSize: 16,
          fontWeight: '600',
          letterSpacing: 16 * -0.015,
        }}
      >
        {formatAmount(item.amount)}
      </Text>
    </View>
  );
}

function GuideSection({ title, items }: { title: string; items: GuideItem[] }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text
        style={{
          color: colors.fg.DEFAULT,
          fontSize: 17,
          fontWeight: '700',
          letterSpacing: 17 * -0.015,
          marginBottom: 8,
        }}
      >
        {title}
      </Text>
      {items.map(item => (
        <GuideRow key={item.label} item={item} />
      ))}
    </View>
  );
}

export default function RewardGuideScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.DEFAULT }} edges={['top']}>
      <TopBar variant="back" title="리워드 가이드" onBack={() => router.back()} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <GuideSection title="리워드는 어떻게 모으나요?" items={EARN_ITEMS} />
        <GuideSection title="리워드는 언제 사용할 수 있나요?" items={SPEND_ITEMS} />
      </ScrollView>
    </SafeAreaView>
  );
}
