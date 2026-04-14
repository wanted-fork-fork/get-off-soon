import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '../../src/components/ui/TopBar';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { CarGrid } from '../../src/components/ui/CarGrid';
import { Button, BottomButtonArea } from '../../src/components/ui/Button';
import { BottomSheet } from '../../src/components/ui/BottomSheet';
import { useJourney } from '../../src/context/JourneyContext';
import { colors } from '../../src/constants/theme';
import QuestionIcon from '../../assets/icons/Question.svg';

export default function SelectCarScreen() {
  const router = useRouter();
  const { state, toggleCar } = useJourney();
  const [helpOpen, setHelpOpen] = useState(false);

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
          현재 탑승칸 위치를 선택해주세요.
        </Text>
        <Text style={{ color: colors.fg.secondary, fontSize: 16, marginBottom: 32 }}>
          최대 두 칸까지 선택할 수 있어요.
        </Text>

        <CarGrid selected={state.carNumbers} onToggle={toggleCar} />

        <TouchableOpacity
          onPress={() => setHelpOpen(true)}
          activeOpacity={0.7}
          style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginTop: 20, gap: 6 }}
        >
          <Text
            style={{
              color: '#61656B',
              fontWeight: '500',
              fontSize: 15,
              lineHeight: 22,
              letterSpacing: -0.225,
            }}
          >
            현재 위치를 잘 모르겠어요
          </Text>
          <QuestionIcon width={18} height={18} />
        </TouchableOpacity>
      </View>

      <BottomButtonArea>
        <Button label="다음" onPress={handleNext} disabled={state.carNumbers.length === 0} />
      </BottomButtonArea>

      <BottomSheet open={helpOpen} onClose={() => setHelpOpen(false)} showHandle={false}>
        <View style={{ width: '100%', aspectRatio: 361 / 211, borderRadius: 12, overflow: 'hidden' }}>
          <Image
            source={require('../../assets/images/info_kannumber.png')}
            style={{ width: '100%', height: '100%' }}
            resizeMode="contain"
          />
        </View>
        <Text
          style={{
            color: colors.fg.DEFAULT,
            fontWeight: '500',
            fontSize: 16,
            lineHeight: 24,
            letterSpacing: -0.24,
            textAlign: 'left',
            marginTop: 20,
            marginBottom: 24,
          }}
        >
          객실 내부 출입문 위에 위치한 전광판을 통해{'\n'}현재 탑승한 열차 칸 번호를 알 수 있어요.
        </Text>
        <Button label="확인했어요" onPress={() => setHelpOpen(false)} />
      </BottomSheet>
    </SafeAreaView>
  );
}
