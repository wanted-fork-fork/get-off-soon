module.exports = ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []),
    [
      '@react-native-seoul/kakao-login',
      {
        kakaoAppKey: process.env.EXPO_PUBLIC_KAKAO_APP_KEY ?? '',
        // Expo SDK 54 / RN 0.81 와 호환되는 Kotlin 버전. 플러그인 기본값 1.5.10 은 KSP 미지원.
        kotlinVersion: '2.0.21',
      },
    ],
  ],
});
