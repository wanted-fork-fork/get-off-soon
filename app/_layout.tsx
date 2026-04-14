import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Text, TextInput } from 'react-native';
import { JourneyProvider } from '../src/context/JourneyContext';
import '../src/shared/styles/global.css';

SplashScreen.preventAutoHideAsync();

const TextAny = Text as any;
TextAny.defaultProps = TextAny.defaultProps || {};
TextAny.defaultProps.style = [{ fontFamily: 'Pretendard-Regular' }, TextAny.defaultProps.style];

const TextInputAny = TextInput as any;
TextInputAny.defaultProps = TextInputAny.defaultProps || {};
TextInputAny.defaultProps.style = [{ fontFamily: 'Pretendard-Regular' }, TextInputAny.defaultProps.style];

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Paperlogy-Bold': require('../assets/fonts/Paperlogy-7Bold.ttf'),
    'Paperlogy-ExtraBold': require('../assets/fonts/Paperlogy-8ExtraBold.ttf'),
    'Pretendard-Regular': require('../assets/fonts/Pretendard-Regular.ttf'),
    'Pretendard-Medium': require('../assets/fonts/Pretendard-Medium.ttf'),
    'Pretendard-SemiBold': require('../assets/fonts/Pretendard-SemiBold.ttf'),
    'Pretendard-Bold': require('../assets/fonts/Pretendard-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <JourneyProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </JourneyProvider>
    </SafeAreaProvider>
  );
}
