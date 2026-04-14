import React from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '../../src/components/ui/TopBar';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Button, BottomButtonArea } from '../../src/components/ui/Button';
import { useJourney } from '../../src/context/JourneyContext';
import { colors } from '../../src/constants/theme';

export default function AppearanceScreen() {
  const router = useRouter();
  const { state, setAppearance } = useJourney();

  const handleDone = () => {
    router.push('/seat-seekers' as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.DEFAULT }} edges={['top']}>
      <TopBar variant="back" onBack={() => router.back()} />
      <ProgressBar current={5} total={5} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 32 }}>
          <Text style={{ color: colors.fg.DEFAULT, fontSize: 18, fontWeight: '600', marginBottom: 8, lineHeight: 28 }}>
            착석 희망자가 자리를 찾아오는데{'\n'}도움이 될 만한 인상착의를{'\n'}알려주세요.
          </Text>
          <Text style={{ color: colors.fg.muted, fontSize: 14, marginBottom: 32 }}>
            입력하지 않아도 진행 가능해요.
          </Text>

          <TextInput
            value={state.appearance}
            onChangeText={setAppearance}
            placeholder="예: 검정 패딩, 파란 백팩, 흰 운동화"
            placeholderTextColor="#797E86"
            multiline
            style={{
              backgroundColor: colors.surface.input,
              color: colors.fg.DEFAULT,
              borderRadius: 12,
              padding: 16,
              fontSize: 16,
              minHeight: 100,
              textAlignVertical: 'top',
            }}
          />

          {state.appearance.length > 0 && (
            <Text style={{ color: colors.fg.muted, fontSize: 12, marginTop: 8, textAlign: 'right' }}>
              {state.appearance.length}자
            </Text>
          )}
        </View>

        <BottomButtonArea>
          <Button label="완료" onPress={handleDone} />
        </BottomButtonArea>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
