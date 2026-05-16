import React from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
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

      <View
        style={{
          position: 'absolute',
          bottom: 40,
          left: 16,
          right: 16,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#101114',
          borderWidth: 1,
          borderColor: '#454A54',
          borderRadius: 99,
          paddingVertical: 16,
          paddingLeft: 32,
          paddingRight: 32,
          gap: 24,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#7BA7FF', fontSize: 13, fontWeight: '600', marginBottom: 6 }}>
            서초 → 잠실새내
          </Text>
          <Text style={{ color: colors.fg.DEFAULT, fontSize: 15, fontWeight: '500' }}>
            여정을 종료했습니다.
          </Text>
        </View>
        <Image
          source={require('../assets/images/shoes.png')}
          style={{ width: 56, height: 56 }}
          resizeMode="contain"
        />
      </View>
    </SafeAreaView>
  );
}
