import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '../src/components/ui/TopBar';
import { CarGrid } from '../src/components/ui/CarGrid';
import { Button, BottomButtonArea } from '../src/components/ui/Button';
import { useJourney } from '../src/context/JourneyContext';
import { colors } from '../src/constants/theme';
import { updateSeatShare } from '../src/api/seatShareUpdate';
import { ApiError } from '../src/api/client';

export default function EditCarScreen() {
  const router = useRouter();
  const { state, toggleCar, setShareId } = useJourney();
  const [submitting, setSubmitting] = useState(false);

  const handleDone = async () => {
    if (!state.shareId || !state.trainId || !state.stationId || !state.seatZone) {
      Alert.alert('수정할 수 없어요', '공유 정보가 누락되었어요.');
      return;
    }
    if (state.carNumbers.length === 0) return;

    setSubmitting(true);
    try {
      const newId = await updateSeatShare({
        currentShareId: state.shareId,
        trainId: state.trainId,
        getOffStationId: state.stationId,
        carriages: state.carNumbers,
        seatZone: state.seatZone,
        appearance: state.appearance.trim(),
      });
      setShareId(newId);
      router.dismiss();
    } catch (err) {
      if (err instanceof ApiError) Alert.alert('수정 실패', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.DEFAULT }} edges={['top']}>
      <TopBar variant="back" onBack={() => router.dismiss()} title="탑승 칸 수정" />

      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 32 }}>
        <Text style={{ color: colors.fg.DEFAULT, fontSize: 18, fontWeight: '600', marginBottom: 4 }}>
          현재 탑승칸 위치를 선택해주세요.
        </Text>
        <Text style={{ color: colors.fg.secondary, fontSize: 16, marginBottom: 32 }}>
          최대 두 칸까지 선택할 수 있어요.
        </Text>

        <CarGrid selected={state.carNumbers} onToggle={toggleCar} />
      </View>

      <BottomButtonArea>
        <Button label="수정 완료" onPress={handleDone} disabled={submitting || state.carNumbers.length === 0} />
      </BottomButtonArea>
    </SafeAreaView>
  );
}
