import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '../src/components/ui/TopBar';
import { Button, BottomButtonArea } from '../src/components/ui/Button';
import { TrainCarPicker } from '../src/components/ui/TrainCar';
import { useJourney } from '../src/context/JourneyContext';
import { colors } from '../src/constants/theme';
import { updateSeatShares } from '../src/api/generated';
import { SEAT_ZONE_TO_POSITION } from '../src/constants/seatZone';
import { ApiError } from '../src/api/client';

export default function EditSeatScreen() {
  const router = useRouter();
  const { state, setSeatZone } = useJourney();
  const [submitting, setSubmitting] = useState(false);

  const handleDone = async () => {
    if (!state.shareId || !state.seatZone) {
      Alert.alert('수정할 수 없어요', '공유 정보가 누락되었어요.');
      return;
    }

    setSubmitting(true);
    try {
      await updateSeatShares(state.shareId, { seatPosition: SEAT_ZONE_TO_POSITION[state.seatZone] });
      router.dismiss();
    } catch (err) {
      if (err instanceof ApiError) Alert.alert('수정 실패', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.DEFAULT }} edges={['top']}>
      <TopBar variant="back" onBack={() => router.dismiss()} title="좌석 구역 수정" />

      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 24 }}>
        <Text style={{ color: colors.fg.DEFAULT, fontSize: 18, fontWeight: '600', marginBottom: 24 }}>
          앉아있는 좌석의 구역을 선택해주세요.
        </Text>

        <TrainCarPicker selected={state.seatZone} onSelect={setSeatZone} />
      </View>

      <BottomButtonArea>
        <Button label="수정 완료" onPress={handleDone} disabled={submitting || !state.seatZone} />
      </BottomButtonArea>
    </SafeAreaView>
  );
}
