import React, { useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '../src/components/ui/TopBar';
import { Button, BottomButtonArea } from '../src/components/ui/Button';
import { useJourney } from '../src/context/JourneyContext';
import { colors } from '../src/constants/theme';
import { updateSeatShares } from '../src/api/generated';
import { ApiError } from '../src/api/client';

export default function EditAppearanceScreen() {
  const router = useRouter();
  const { state, setAppearance } = useJourney();
  const [submitting, setSubmitting] = useState(false);

  const handleDone = async () => {
    if (!state.shareId) {
      Alert.alert('수정할 수 없어요', '공유 정보가 누락되었어요.');
      return;
    }
    if (state.appearance.trim().length < 1) return;

    setSubmitting(true);
    try {
      await updateSeatShares(state.shareId, { appearance: state.appearance.trim() }, { silent: true });
      router.dismiss();
    } catch (err) {
      if (err instanceof ApiError) Alert.alert('수정 실패', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.DEFAULT }} edges={['top']}>
      <TopBar variant="back" onBack={() => router.dismiss()} title="인상착의 수정" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 32 }}>
          <Text style={{ color: colors.fg.DEFAULT, fontSize: 18, fontWeight: '600', marginBottom: 32, lineHeight: 28 }}>
            착석 희망자가 자리를 찾아오는데{'\n'}도움이 될 만한 인상착의를 알려주세요.
          </Text>

          <TextInput
            value={state.appearance}
            onChangeText={setAppearance}
            placeholder="예: 검정 패딩, 파란 백팩, 흰 운동화"
            placeholderTextColor="#484B51"
            style={{
              color: colors.fg.DEFAULT,
              fontSize: 16,
              paddingVertical: 12,
              borderBottomWidth: 2,
              borderBottomColor: '#0095F8',
            }}
          />
        </View>

        <BottomButtonArea>
          <Button label="수정 완료" onPress={handleDone} disabled={submitting || state.appearance.trim().length < 1} />
        </BottomButtonArea>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
