import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '../../src/components/ui/TopBar';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { CarTabs } from '../../src/components/ui/CarTabs';
import { Button, BottomButtonArea } from '../../src/components/ui/Button';
import { useJourney } from '../../src/context/JourneyContext';
import { colors } from '../../src/constants/theme';

export default function SelectCarScreen() {
  const router = useRouter();
  const { state, toggleCar } = useJourney();

  const totalSteps = state.role === 'getting-off' ? 5 : 3;
  const isLastStep = state.role === 'want-seat';

  const handleNext = () => {
    if (state.carNumbers.length === 0) return;
    if (isLastStep) {
      router.push('/getting-off-list' as any);
    } else {
      router.push('/(onboarding)/select-seat' as any);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.DEFAULT }} edges={['top']}>
      <TopBar variant="back" onBack={() => router.back()} />
      <ProgressBar current={3} total={totalSteps} />

      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 32 }}>
        <Text style={{ color: colors.fg.DEFAULT, fontSize: 18, fontWeight: '600', marginBottom: 4 }}>
          현재 탑승칸 위치를{'\n'}선택해주세요.
        </Text>
        <Text style={{ color: colors.fg.secondary, fontSize: 16, marginBottom: 32 }}>
          최대 두 칸까지 선택할 수 있어요.
        </Text>

        <CarTabs selected={state.carNumbers} onToggle={toggleCar} />

        {/* 열차 배치 시각화 */}
        <View style={{ borderRadius: 12, backgroundColor: colors.surface.card, marginTop: 24, padding: 16 }}>
          <Text style={{ color: colors.fg.muted, fontSize: 12, marginBottom: 12 }}>열차 칸 배치</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(car => {
              const isSelected = state.carNumbers.includes(car);
              return (
                <View
                  key={car}
                  style={{
                    backgroundColor: isSelected ? colors.accent.tab : colors.progress.track,
                    borderRadius: 6,
                    width: 52,
                    height: 36,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: isSelected ? colors.white : colors.fg.muted, fontSize: 13, fontWeight: '600' }}>
                    {car}칸
                  </Text>
                </View>
              );
            })}
          </View>
          <Text style={{ color: colors.fg.muted, fontSize: 11, marginTop: 12 }}>
            ← 앞 (1호차)          뒤 (10호차) →
          </Text>
        </View>

        {state.carNumbers.length > 0 && (
          <Text style={{ color: colors.accent.link, fontSize: 14, fontWeight: '600', marginTop: 16 }}>
            선택: {state.carNumbers.sort((a, b) => a - b).join(', ')}번 칸
          </Text>
        )}
      </View>

      <BottomButtonArea>
        <Button label="다음" onPress={handleNext} disabled={state.carNumbers.length === 0} />
      </BottomButtonArea>
    </SafeAreaView>
  );
}
