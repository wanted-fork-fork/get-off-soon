import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, TouchableOpacity, Text } from 'react-native';
import { colors } from '../../constants/theme';

const ITEM_WIDTH = 64;
const ITEM_GAP = 4;
const H_PADDING = 16;

interface CarTabsProps {
  selected: number[];
  onToggle: (car: number) => void;
  cars?: number[];
}

export function CarTabs({ selected, onToggle, cars = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }: CarTabsProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [viewportWidth, setViewportWidth] = useState(0);

  // 현재 선택된 호차(마지막 선택값)를 가로 스크롤 가운데로 맞춘다.
  const activeCar = selected.length > 0 ? selected[selected.length - 1] : null;

  useEffect(() => {
    if (activeCar == null || viewportWidth === 0) return;
    const index = cars.indexOf(activeCar);
    if (index < 0) return;
    const itemCenter = H_PADDING + index * (ITEM_WIDTH + ITEM_GAP) + ITEM_WIDTH / 2;
    const target = Math.max(0, itemCenter - viewportWidth / 2);
    scrollRef.current?.scrollTo({ x: target, animated: true });
    // cars는 사실상 고정 목록이라 의존성에서 제외한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCar, viewportWidth]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      onLayout={(e) => setViewportWidth(e.nativeEvent.layout.width)}
      contentContainerStyle={{ paddingHorizontal: H_PADDING, gap: ITEM_GAP }}
      style={{ flexGrow: 0 }}
    >
      {cars.map(car => {
        const isSelected = selected.includes(car);
        return (
          <TouchableOpacity
            key={car}
            onPress={() => onToggle(car)}
            style={{ borderRadius: 8, width: ITEM_WIDTH, height: 48, backgroundColor: isSelected ? colors.accent.tab : colors.surface.input, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text
              style={{ color: isSelected ? colors.white : colors.fg.inactive, fontSize: 16, fontWeight: '600' }}
            >
              {car}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
