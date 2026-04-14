import React from 'react';
import { View, ScrollView } from 'react-native';
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
            description="내 자리를 다른 사람에게 알려주세요."
            onPress={handleGettingOff}
            image={require('../assets/images/main_1.png')}
          />
          <RoleCard
            title="앉고 싶어요"
            description={'곧 내릴 사람을 먼저 확인하고\n편히 앉아가세요.'}
            onPress={handleWantSeat}
            image={require('../assets/images/main_2.png')}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
