import React from 'react';
import { TouchableOpacity, Text, Image, ImageSourcePropType } from 'react-native';
import { colors } from '../../constants/theme';

interface RoleCardProps {
  title: string;
  description: string;
  onPress: () => void;
  image?: ImageSourcePropType;
}

export function RoleCard({ title, description, onPress, image }: RoleCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        position: 'relative',
        borderRadius: 12,
        backgroundColor: colors.surface.card,
        paddingLeft: 16,
        paddingTop: 16,
        paddingBottom: 16,
        minHeight: 146,
        gap: 16,
        overflow: 'hidden',
      }}
    >
      <Text
        style={{
          color: colors.fg.DEFAULT,
          fontWeight: '600',
          fontSize: 24,
          lineHeight: 28,
          letterSpacing: -0.36,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          color: colors.fg.secondary,
          fontSize: 16,
          lineHeight: 24,
          letterSpacing: -0.24,
        }}
      >
        {description}
      </Text>
      {image && (
        <Image
          source={image}
          style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 128, height: 146 }}
          resizeMode="contain"
        />
      )}
    </TouchableOpacity>
  );
}
