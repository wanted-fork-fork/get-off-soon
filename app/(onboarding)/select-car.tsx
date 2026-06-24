import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { CarGrid } from '../../src/components/ui/CarGrid';
import { Button, BottomButtonArea } from '../../src/components/ui/Button';
import { BottomSheet } from '../../src/components/ui/BottomSheet';
import { useJourney } from '../../src/context/JourneyContext';
import { colors } from '../../src/constants/theme';
import { createSeatRequest } from '../../src/api/generated';
import { ApiError } from '../../src/api/client';
import QuestionIcon from '../../assets/icons/Question.svg';

export default function SelectCarScreen() {
  const router = useRouter();
  const { state, toggleCar, setRequestId } = useJourney();
  const [helpOpen, setHelpOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isLastStep = state.role === 'want-seat';

  const handleNext = async () => {
    if (state.carNumbers.length === 0) return;
    if (isLastStep) {
      if (!state.trainId || !state.stationId || state.carNumbers.length < 1) {
        Alert.alert('필수 정보가 누락되었어요', '이전 단계 입력을 확인해주세요.');
        return;
      }
      setSubmitting(true);
      try {
        const res = await createSeatRequest({
          trainId: state.trainId,
          getOffStationId: state.stationId,
          carriages: state.carNumbers,
        }, { silent: true });
        setRequestId(res.id!);
        router.replace('/seat-seekers' as any);
      } catch (err) {
        if (err instanceof ApiError) {
          Alert.alert('등록 실패', err.message);
        } else {
          throw err;
        }
      } finally {
        setSubmitting(false);
      }
    } else {
      router.push('/(onboarding)/select-seat' as any);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface.DEFAULT }}>
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
        <Button label="다음" onPress={handleNext} disabled={submitting || state.carNumbers.length === 0} />
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
    </View>
  );
}
