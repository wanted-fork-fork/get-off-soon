import React from 'react';
import { View } from 'react-native';
import { colors } from '../../constants/theme';

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percent = (current / total) * 100;
  return (
    <View style={{ backgroundColor: colors.progress.track, width: '100%', height: 7 }}>
      <View
        style={{ width: `${percent}%`, backgroundColor: colors.progress.fill, height: '100%' }}
      />
    </View>
  );
}
