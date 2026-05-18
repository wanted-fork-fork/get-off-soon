import { Stack, useRouter, useSegments } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '../../src/components/ui/TopBar';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { useJourney } from '../../src/context/JourneyContext';
import { colors } from '../../src/constants/theme';

const STEP_META: Record<string, { step: number; title: string }> = {
  'select-line': { step: 1, title: '여정 선택' },
  'select-station': { step: 2, title: '여정 선택' },
  'select-car': { step: 3, title: '자리 정보' },
  'select-seat': { step: 4, title: '자리 정보' },
  appearance: { step: 5, title: '인상착의' },
};

export default function OnboardingLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { state } = useJourney();

  const last = segments[segments.length - 1] ?? '';
  const meta = STEP_META[last] ?? { step: 1, title: '' };
  const totalSteps = state.role === 'getting-off' ? 5 : 3;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.DEFAULT }} edges={['top']}>
      <TopBar variant="back" onBack={() => router.back()} title={meta.title} />
      <ProgressBar current={meta.step} total={totalSteps} />
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.surface.DEFAULT },
            animation: 'slide_from_right',
          }}
        />
      </View>
    </SafeAreaView>
  );
}
