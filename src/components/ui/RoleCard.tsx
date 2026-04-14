import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { colors } from '../../constants/theme';

interface RoleCardProps {
  title: string;
  description: string;
  onPress: () => void;
}

export function RoleCard({ title, description, onPress }: RoleCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ borderRadius: 12, backgroundColor: colors.surface.card, paddingHorizontal: 16, paddingVertical: 20, gap: 8 }}
    >
      <Text style={{ color: colors.fg.DEFAULT, fontSize: 22, fontWeight: '600' }}>
        {title}
      </Text>
      <Text style={{ color: colors.fg.secondary, fontSize: 16 }}>
        {description}
      </Text>
    </TouchableOpacity>
  );
}
