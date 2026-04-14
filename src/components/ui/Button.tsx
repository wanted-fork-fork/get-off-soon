import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { colors } from '../../constants/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function Button({ label, onPress, variant = 'primary', disabled = false }: ButtonProps) {
  const bgColor = disabled
    ? colors.surface.input
    : variant === 'primary'
    ? colors.accent.blue
    : colors.surface.input;
  const textColor = disabled ? colors.fg.muted : colors.fg.onAccent;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{ borderRadius: 12, backgroundColor: bgColor, height: 48, alignItems: 'center', justifyContent: 'center' }}
    >
      <Text style={{ color: textColor, fontSize: 16, fontWeight: '600' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function BottomButtonArea({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ backgroundColor: colors.surface.DEFAULT, paddingHorizontal: 16, paddingBottom: 32, paddingTop: 12 }}>
      {children}
    </View>
  );
}
