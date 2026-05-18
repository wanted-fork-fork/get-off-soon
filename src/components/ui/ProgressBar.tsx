import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { colors } from '../../constants/theme';

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percent = total > 0 ? Math.max(0, Math.min(100, (current / total) * 100)) : 0;
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: percent,
      duration: 350,
      useNativeDriver: false,
    }).start();
  }, [percent, widthAnim]);

  const width = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={{ backgroundColor: colors.progress.track, width: '100%', height: 7 }}>
      <Animated.View
        style={{ width, backgroundColor: colors.progress.fill, height: '100%' }}
      />
    </View>
  );
}
