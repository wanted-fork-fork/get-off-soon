import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/constants/theme';

const PAGES = [
  { label: '메인 (index)', path: '/' },
  { label: '노선 선택 (select-line)', path: '/(onboarding)/select-line' },
  { label: '역 선택 (select-station)', path: '/(onboarding)/select-station' },
  { label: '호차 선택 (select-car)', path: '/(onboarding)/select-car' },
  { label: '좌석 선택 (select-seat)', path: '/(onboarding)/select-seat' },
  { label: '인상착의 (appearance)', path: '/(onboarding)/appearance' },
  { label: '하차 예정자 상태 (getting-off-status)', path: '/getting-off-status' },
  { label: '하차 예정자 목록 (getting-off-list)', path: '/getting-off-list' },
  { label: '착석 희망자 (seat-seekers)', path: '/seat-seekers' },
  { label: '여정 종료 (journey-end)', path: '/journey-end' },
];

export default function DevScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.DEFAULT }}>
      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} contentContainerStyle={{ paddingTop: 24, paddingBottom: 40 }}>
        <Text style={{ color: colors.fg.DEFAULT, fontSize: 20, fontWeight: '700', marginBottom: 24 }}>
          Dev - 페이지 바로가기
        </Text>
        {PAGES.map((page) => (
          <TouchableOpacity
            key={page.path}
            onPress={() => router.push(page.path as any)}
            style={{
              backgroundColor: '#262A30',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              marginBottom: 8,
            }}
          >
            <Text style={{ color: colors.fg.DEFAULT, fontSize: 15, fontWeight: '500' }}>
              {page.label}
            </Text>
            <Text style={{ color: colors.fg.muted, fontSize: 12, marginTop: 4 }}>
              {page.path}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
