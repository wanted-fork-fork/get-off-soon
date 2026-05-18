import React, { useState } from 'react';
import { View, Pressable, Image } from 'react-native';
import { colors } from '../../constants/theme';
import SeatFrame from '../../../assets/icons/SeatFrame.svg';

const FRAME_W = 297;
const FRAME_H = 555;
const SEAT_COLOR = '#424B62';
const OCCUPANT_COLOR = '#343B4B';
const FLEX = { occupant: 55, seat: 104, gap: 28 } as const;

interface TrainCarPickerProps {
  selected: string | null;
  onSelect: (id: string) => void;
}

export function TrainCarPicker({ selected, onSelect }: TrainCarPickerProps) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  const ratio = FRAME_W / FRAME_H;
  const carWidth = box.w === 0 ? 0 : Math.min(FRAME_W, box.w, box.h * ratio);
  const carHeight = carWidth / ratio;

  return (
    <View
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
    >
      {carWidth > 0 && (
        <View style={{ width: carWidth, height: carHeight }}>
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
            <SeatColumn ids={['A', 'C', 'E']} selected={selected} onSelect={onSelect} />
            <SeatColumn ids={['B', 'D', 'F']} selected={selected} onSelect={onSelect} />
          </View>
        </View>
      )}
    </View>
  );
}

function SeatColumn({
  ids,
  selected,
  onSelect,
}: {
  ids: string[];
  selected: string | null;
  onSelect: (id: string) => void;
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
        source={require('../../../assets/images/priority-seat.png')}
        style={{ width: 28, height: 28, tintColor: '#5A6275' }}
        resizeMode="contain"
      />
    </View>
  );
}
