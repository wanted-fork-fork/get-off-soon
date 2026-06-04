import React from 'react';
import { TouchableOpacity, View, Text, Image, ImageSourcePropType } from 'react-native';
import { colors } from '../../constants/theme';

interface RoleCardProps {
  title: string;
  description: string;
  onPress: () => void;
  image?: ImageSourcePropType;
  disabled?: boolean;
  disabledText?: string;
}

export function RoleCard({ title, description, onPress, image, disabled, disabledText }: RoleCardProps) {
  const contentOpacity = disabled ? 0.25 : 1;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.2}
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
          opacity: contentOpacity,
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
          opacity: contentOpacity,
        }}
      >
        {description}
      </Text>
      {image && (
        <Image
          source={image}
          style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 128, height: 146, opacity: contentOpacity }}
          resizeMode="contain"
        />
      )}
      {disabled && disabledText && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 16,
          }}
        >
          <Text
            style={{
              color: '#F9A7A7',
              fontSize: 16,
              fontWeight: '600',
              lineHeight: 24,
              letterSpacing: -0.24,
              textAlign: 'center',
            }}
          >
            {disabledText}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
