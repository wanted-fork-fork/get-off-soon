/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // 배경 (Surfaces)
        surface: {
          DEFAULT: '#1B1D22',
          card: '#262A30',
          input: '#272B34',
          deep: '#0F1113',
        },
        // 전경/텍스트 (Foreground)
        fg: {
          DEFAULT: '#E4E5E7',
          secondary: '#92969F',
          muted: '#797E86',
          inactive: '#C2C2C2',
          onAccent: '#EEEEEF',
        },
        // 강조 (Accent)
        accent: {
          blue: '#0094F7',
          tab: '#2C63D2',
          link: '#7BA7FF',
        },
        // 노선 (Line)
        line: {
          2: '#00A44A',
        },
        // 진행 바 (Progress)
        progress: {
          track: '#272C35',
          fill: '#2D64D2',
        },
        // 구분선
        divider: 'rgba(255,255,255,0.06)',
      },
      fontFamily: {
        sans: ['Pretendard-Regular'],
        pretendard: ['Pretendard-Regular'],
        'pretendard-medium': ['Pretendard-Medium'],
        'pretendard-semibold': ['Pretendard-SemiBold'],
        'pretendard-bold': ['Pretendard-Bold'],
        paperlogy: ['Paperlogy-Bold'],
        'paperlogy-extrabold': ['Paperlogy-ExtraBold'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
      },
    },
  },
  plugins: [],
};
