import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, BottomButtonArea } from '../../src/components/ui/Button';
import { TrainCarPicker } from '../../src/components/ui/TrainCar';
import { useJourney } from '../../src/context/JourneyContext';
import { colors } from '../../src/constants/theme';

export default function SelectSeatScreen() {
  const router = useRouter();
  const { state, setSeatZone } = useJourney();

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface.DEFAULT }}>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 24 }}>
        <Text style={{ color: colors.fg.DEFAULT, fontSize: 18, fontWeight: '600', marginBottom: 24 }}>
          앉아있는 좌석의 구역을 선택해주세요.
        </Text>

        <TrainCarPicker selected={state.seatZone} onSelect={setSeatZone} />
      </View>

      <BottomButtonArea>
        <Button
          label="다음"
          onPress={() => {
            if (!state.seatZone) return;
            router.push('/(onboarding)/appearance' as any);
          }}
          disabled={!state.seatZone}
        />
      </BottomButtonArea>
    </View>
  );
}
