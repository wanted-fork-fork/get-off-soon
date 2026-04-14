import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/constants/theme';
import { useJourney } from '../src/context/JourneyContext';
import { TopBar } from '../src/components/ui/TopBar';
import { RoleCard } from '../src/components/ui/RoleCard';

export default function HomeScreen() {
  const router = useRouter();
  const { setRole } = useJourney();

  const handleGettingOff = () => {
    setRole('getting-off');
    router.push('/(onboarding)/select-line' as any);
  };

  const handleWantSeat = () => {
    setRole('want-seat');
    router.push('/(onboarding)/select-line' as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.DEFAULT }} edges={['top']}>
      <TopBar variant="home" />
      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} contentContainerStyle={{ paddingTop: 32, gap: 12 }}>
        {/* 역할 선택 카드 */}
        <View style={{ gap: 12 }}>
          <RoleCard
            title="곧 내려요"
            description="앉고 싶은 사람에게 자리 정보 제공"
            onPress={handleGettingOff}
          />
          <RoleCard
            title="앉고 싶어요"
            description="하차 예정자 보기"
            onPress={handleWantSeat}
          />
        </View>

        {/* 최근 여정 카드 */}
        <TouchableOpacity
          onPress={() => router.push('/journey-end' as any)}
          style={{ borderRadius: 12, backgroundColor: colors.surface.deep, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}
        >
          <View style={{ gap: 4 }}>
            <Text style={{ color: colors.accent.link, fontSize: 14, fontWeight: '600' }}>
              서초 → 잠실새내
            </Text>
            <Text style={{ color: colors.fg.DEFAULT, fontSize: 18, fontWeight: '600' }}>
              여정을 종료했습니다.
            </Text>
          </View>
          {/* 기차 아이콘 자리 */}
          <View
            style={{ borderRadius: 8, width: 62, height: 62, backgroundColor: colors.surface.card, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontSize: 28 }}>🚇</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
