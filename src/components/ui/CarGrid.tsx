import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { colors } from '../../constants/theme';

interface CarGridProps {
  selected: number[];
  onToggle: (car: number) => void;
}

const ROWS: number[][] = [
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
];

export function CarGrid({ selected, onToggle }: CarGridProps) {
  const enabledSet =
    selected.length === 0
      ? null
      : new Set(
          selected.flatMap(c => [c - 1, c, c + 1]).filter(c => c >= 0 && c <= 9),
        );

  return (
    <View style={{ gap: 8 }}>
      {ROWS.map((row, rIdx) => (
        <View key={rIdx} style={{ flexDirection: 'row', gap: 8 }}>
          {row.map((car) => {
            const isSelected = selected.includes(car);
            const disabled =
              (!isSelected && selected.length >= 2) ||
              (enabledSet !== null && !enabledSet.has(car));
            return (
              <TouchableOpacity
                key={car}
                activeOpacity={0.8}
                onPress={() => onToggle(car)}
                disabled={disabled}
                style={{
                  flex: 1,
                  height: 56,
                  borderRadius: 8,
                  backgroundColor: isSelected
                    ? colors.accent.tab
                    : disabled
                      ? colors.surface.disabled
                      : colors.surface.inputActive,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    color: isSelected ? colors.white : disabled ? colors.fg.disabled : colors.fg.inactive,
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  {car}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}
