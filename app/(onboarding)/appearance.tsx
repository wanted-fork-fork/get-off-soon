import React, { useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '../../src/components/ui/TopBar';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Button, BottomButtonArea } from '../../src/components/ui/Button';
import { useJourney } from '../../src/context/JourneyContext';
import { colors } from '../../src/constants/theme';
import { SEAT_ZONE_TO_POSITION } from '../../src/constants/seatZone';
import { createSeatShare } from '../../src/api/generated';
import { ApiError } from '../../src/api/client';

export default function AppearanceScreen() {
  const router = useRouter();
  const { state, setAppearance, setShareId } = useJourney();
  const [submitting, setSubmitting] = useState(false);

  const handleDone = async () => {
    if (state.role !== 'getting-off') {
      router.push('/seat-seekers' as any);
      return;
    }

    if (
      !state.trainId ||
      !state.stationId ||
      state.carNumbers.length < 1 ||
      !state.seatZone ||
      state.appearance.trim().length < 1
    ) {
      Alert.alert('필수 정보가 누락되었어요', '이전 단계 입력을 확인해주세요.');
      return;
    }

    const seatPosition = SEAT_ZONE_TO_POSITION[state.seatZone!];

    try {
      setSubmitting(true);
      const res = await createSeatShare({
        trainId: state.trainId!,
        getOffStationId: state.stationId!,
        carriages: state.carNumbers,
        seatPosition,
        appearance: state.appearance.trim(),
      });
      setShareId(res.id!);
      router.replace('/getting-off-status' as any);
    } catch (err) {
      if (err instanceof ApiError) {
        Alert.alert('등록 실패', err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.DEFAULT }} edges={['top']}>
      <TopBar variant="back" onBack={() => router.back()} title="인상착의" />
      <ProgressBar current={5} total={5} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 32 }}>
          <Text style={{ color: colors.fg.DEFAULT, fontSize: 18, fontWeight: '600', marginBottom: 32, lineHeight: 28 }}>
            착석 희망자가 자리를 찾아오는데{'\n'}도움이 될 만한 인상착의를 알려주세요.
          </Text>

          <TextInput
            value={state.appearance}
            onChangeText={setAppearance}
            placeholder="예: 검정 패딩, 파란 백팩, 흰 운동화"
            placeholderTextColor="#484B51"
            style={{
              color: colors.fg.DEFAULT,
              fontSize: 16,
              paddingVertical: 12,
              borderBottomWidth: 2,
              borderBottomColor: '#0095F8',
            }}
          />

        </View>

        <BottomButtonArea>
          <Button label="하차 정보를 공유할게요" onPress={handleDone} disabled={submitting} />
        </BottomButtonArea>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
