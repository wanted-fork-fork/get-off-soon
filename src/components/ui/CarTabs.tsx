import React from 'react';
import { ScrollView, TouchableOpacity, Text } from 'react-native';
import { colors } from '../../constants/theme';

interface CarTabsProps {
  selected: number[];
  onToggle: (car: number) => void;
  cars?: number[];
}

export function CarTabs({ selected, onToggle, cars = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }: CarTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 4 }}
      style={{ flexGrow: 0 }}
    >
      {cars.map(car => {
        const isSelected = selected.includes(car);
        return (
          <TouchableOpacity
            key={car}
            onPress={() => onToggle(car)}
            style={{ borderRadius: 8, width: 64, height: 48, backgroundColor: isSelected ? colors.accent.tab : colors.surface.input, alignItems: 'center', justifyContent: 'center' }}
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
