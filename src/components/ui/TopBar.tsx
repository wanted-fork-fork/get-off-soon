import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../constants/theme';
import ArrowLeftIcon from '../../../assets/icons/ArrowLeft.svg';

interface TopBarProps {
  variant?: 'home' | 'back' | 'back-action';
  onBack?: () => void;
  rightAction?: React.ReactNode;
  title?: string;
}

export function TopBar({ variant = 'home', onBack, rightAction, title }: TopBarProps) {
  const router = useRouter();

  const handleBack = () => {
    if (!onBack) {
      router.replace('/' as any);
      return;
    }
    try {
      onBack();
    } catch (e) {
      console.warn('[TopBar] back action failed, redirecting home', e);
      router.replace('/' as any);
    }
  };

  return (
    <View
      style={{ backgroundColor: colors.surface.DEFAULT, paddingHorizontal: 16, height: 59, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
    >
      {variant === 'home' ? (
        <Text style={{ color: colors.fg.DEFAULT, fontSize: 24, fontWeight: '800', fontFamily: 'Paperlogy-ExtraBold', lineHeight: 24, letterSpacing: 24 * -0.015, textAlignVertical: 'center' }}>
          곧 내려요
        </Text>
      ) : (
        <TouchableOpacity
          onPress={handleBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
        >
          <ArrowLeftIcon width={24} height={24} />
        </TouchableOpacity>
      )}

      {title && variant !== 'home' && (
        <Text pointerEvents="none" style={{ position: 'absolute', left: 56, right: 56, textAlign: 'center', color: colors.fg.DEFAULT, fontSize: 17, fontWeight: '600' }}>
          {title}
        </Text>
      )}

      {variant === 'home' && (
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <TouchableOpacity>
            <Text
              style={{
                color: colors.fg.DEFAULT,
                fontSize: 16,
                lineHeight: 20,
                letterSpacing: -0.24,
              }}
            >
              알림
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/mypage' as any)}>
            <Text
              style={{
                color: colors.fg.DEFAULT,
                fontSize: 16,
                lineHeight: 20,
                letterSpacing: -0.24,
              }}
            >
              마이페이지
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {variant === 'back-action' && rightAction}
    </View>
  );
}
