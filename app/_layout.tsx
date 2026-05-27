import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Text, TextInput } from 'react-native';
import { initializeKakaoSDK } from '@react-native-kakao/core';
import { JourneyProvider } from '../src/context/JourneyContext';
import { bootstrapAuth } from '../src/api/tokenStore';
import '../src/shared/styles/global.css';

SplashScreen.preventAutoHideAsync();

const KAKAO_APP_KEY = process.env.EXPO_PUBLIC_KAKAO_APP_KEY;
if (KAKAO_APP_KEY) {
  initializeKakaoSDK(KAKAO_APP_KEY).catch((err) =>
    console.warn('[kakao] initializeKakaoSDK failed', err),
  );
} else {
  console.warn('[kakao] EXPO_PUBLIC_KAKAO_APP_KEY 가 비어 있어 SDK 초기화를 건너뜁니다.');
}

export const unstable_settings = {
  initialRouteName: 'index',
};

const TextAny = Text as any;
TextAny.defaultProps = TextAny.defaultProps || {};
TextAny.defaultProps.style = [{ fontFamily: 'Pretendard-Regular' }, TextAny.defaultProps.style];

const TextInputAny = TextInput as any;
TextInputAny.defaultProps = TextInputAny.defaultProps || {};
TextInputAny.defaultProps.style = [{ fontFamily: 'Pretendard-Regular' }, TextInputAny.defaultProps.style];

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Paperlogy-Bold': require('../assets/fonts/Paperlogy-7Bold.ttf'),
    'Paperlogy-ExtraBold': require('../assets/fonts/Paperlogy-8ExtraBold.ttf'),
    'Pretendard-Regular': require('../assets/fonts/Pretendard-Regular.ttf'),
    'Pretendard-Medium': require('../assets/fonts/Pretendard-Medium.ttf'),
    'Pretendard-SemiBold': require('../assets/fonts/Pretendard-SemiBold.ttf'),
    'Pretendard-Bold': require('../assets/fonts/Pretendard-Bold.ttf'),
  });
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    bootstrapAuth()
      .catch((err) => console.warn('[auth] bootstrap failed', err))
      .finally(() => setAuthReady(true));
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && authReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, authReady]);

  if (!(fontsLoaded || fontError) || !authReady) return null;

  return (
    <SafeAreaProvider>
      <JourneyProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#1B1D22' },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="edit-car" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="edit-seat" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="edit-appearance" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        </Stack>
      </JourneyProvider>
    </SafeAreaProvider>
  );
}
