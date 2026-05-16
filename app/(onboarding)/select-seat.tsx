import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '../../src/components/ui/TopBar';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Button, BottomButtonArea } from '../../src/components/ui/Button';
import { useJourney } from '../../src/context/JourneyContext';
import { colors } from '../../src/constants/theme';
import { Image } from 'react-native';
import SeatFrame from '../../assets/icons/SeatFrame.svg';

// 프레임 SVG viewBox 기준 비율 상수
// 좌석 배치는 이 비율로 계산되어 문(손잡이 바)에 살짝 걸치는 사이즈가 됨
const FRAME_W = 297;
const FRAME_H = 555;
const SEAT_COLOR = '#424B62';
const OCCUPANT_COLOR = '#343B4B';

// 좌석 열 flex 비율: occupant(55) + gap(28) + seat(104)×3 + gap(28)×3 + occupant(55) = 534
const FLEX = { occupant: 55, seat: 104, gap: 28 } as const;

export default function SelectSeatScreen() {
  const router = useRouter();
  const { state, setSeatZone } = useJourney();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.DEFAULT }} edges={['top']}>
      <TopBar variant="back" onBack={() => router.back()} title="자리 정보" />
      <ProgressBar current={4} total={5} />

      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 24 }}>
        <Text style={{ color: colors.fg.DEFAULT, fontSize: 18, fontWeight: '600', marginBottom: 24 }}>
          앉아있는 좌석의 구역을 선택해주세요.
        </Text>

        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <TrainCar selected={state.seatZone} onSelect={setSeatZone} />
        </View>
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
    </SafeAreaView>
  );
}

function TrainCar({ selected, onSelect }: { selected: string | null; onSelect: (id: string) => void }) {
  return (
    <View style={{ width: '100%', maxWidth: FRAME_W, aspectRatio: FRAME_W / FRAME_H }}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <SeatFrame width="100%" height="100%" />
      </View>

      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 16,
        }}
      >
        <SeatColumn ids={['A', 'C', 'E']} selected={selected} onSelect={onSelect} side="left" />
        <SeatColumn ids={['B', 'D', 'F']} selected={selected} onSelect={onSelect} side="right" />
      </View>
    </View>
  );
}

function SeatColumn({
  ids,
  selected,
  onSelect,
  side,
}: {
  ids: string[];
  selected: string | null;
  onSelect: (id: string) => void;
  side: 'left' | 'right';
}) {

  return (
    <View style={{ width: 68 }}>
      <OccupantCell />
      <View style={{ flex: FLEX.gap }} />

      {ids.map((id, i) => (
        <React.Fragment key={id}>
          <Pressable
            onPress={() => onSelect(id)}
            style={{
              flex: FLEX.seat,
              borderRadius: 8,
              backgroundColor: selected === id ? colors.accent.blue : SEAT_COLOR,
            }}
          />
          {i < ids.length - 1 && <View style={{ flex: FLEX.gap }} />}
        </React.Fragment>
      ))}

      <View style={{ flex: FLEX.gap }} />
      <OccupantCell />
    </View>
  );
}

function OccupantCell() {
  return (
    <View
      style={{
        flex: FLEX.occupant,
        borderRadius: 8,
        backgroundColor: OCCUPANT_COLOR,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Image
        source={require('../../assets/images/priority-seat.png')}
        style={{ width: 28, height: 28, tintColor: '#5A6275' }}
        resizeMode="contain"
      />
    </View>
  );
}
