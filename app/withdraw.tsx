import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../src/constants/theme';
import { TopBar } from '../src/components/ui/TopBar';
import { deleteAccount } from '../src/api/generated';
import { resetAuth } from '../src/api/tokenStore';
import { ApiError } from '../src/api/client';
import { useJourney } from '../src/context/JourneyContext';

export default function WithdrawScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reset: resetJourney } = useJourney();
  const [submitting, setSubmitting] = useState(false);

  const handleWithdraw = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await deleteAccount();
    } catch (err) {
      if (err instanceof ApiError) {
        Alert.alert('탈퇴 실패', err.message);
      } else {
        Alert.alert('탈퇴 실패', '잠시 후 다시 시도해주세요.');
      }
      setSubmitting(false);
      return;
    }
    try {
      await resetAuth();
      resetJourney();
      router.replace('/' as any);
    } catch {
      Alert.alert('탈퇴 처리 실패', '잠시 후 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.DEFAULT }} edges={['top']}>
      <TopBar variant="back" title="회원 탈퇴" onBack={() => router.back()} />

      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 24 }}>
        <Text
          style={{
            color: colors.fg.DEFAULT,
            fontSize: 18,
            fontWeight: '600',
            lineHeight: 18 * 1.4,
            letterSpacing: 18 * -0.015,
          }}
        >
          탈퇴 전 꼭 확인해주세요.
        </Text>
      </View>

      <View style={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 16 }}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleWithdraw}
          disabled={submitting}
          style={{
            height: 52,
            borderRadius: 12,
            backgroundColor: colors.accent.blue,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: submitting ? 0.6 : 1,
          }}
        >
          <Text style={{ color: colors.fg.onAccent, fontSize: 16, fontWeight: '600', letterSpacing: 16 * -0.015 }}>
            탈퇴할게요
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
