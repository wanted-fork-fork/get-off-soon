/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // 색상 시스템 (Figma에서 추출)
      colors: {
        // Primary Colors
        primary: {
          DEFAULT: '#333333', // 메인 텍스트, 스트로크
          light: '#918B92',
          dark: '#292C33',
        },
        // Secondary Colors
        secondary: {
          DEFAULT: '#C3C3C3', // 보조 텍스트, 비활성 상태
          light: 'rgba(195, 195, 195, 0.5)',
        },
        // Background Colors
        background: {
          DEFAULT: '#FFFFFF', // 메인 배경
          card: '#F8F8F8', // 카드 배경
          overlay: 'rgba(51, 51, 51, 0.5)', // 모달 오버레이
          light: 'rgba(255, 255, 255, 0.8)',
        },
        // Accent Colors
        accent: {
          DEFAULT: '#FFBF4C', // 강조 색상
          light: '#FBF6ED',
        },
        // Status Colors
        error: '#FF1919', // 에러, 경고
        success: '#00C851', // 성공
        warning: '#FFBF4C', // 경고
        info: '#333333', // 정보
        // Border Colors
        border: {
          DEFAULT: 'rgba(0, 0, 0, 0.1)',
          light: '#E3E3E3',
          dark: '#333333',
        },
        // Shadow Colors
        shadow: 'rgba(51, 51, 51, 0.15)',
        // Gray Scale
        gray: {
          50: '#F8F8F8',
          100: '#F5F5F5',
          200: '#E2E2E2',
          300: '#D9D9D9',
          400: '#C3C3C3',
          500: '#918B92',
          600: '#333333',
          700: '#292C33',
          800: '#000000',
        },
      },
      // 폰트 패밀리
      fontFamily: {
        pretendard: ['Pretendard', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      // 폰트 크기 및 라인 높이
      fontSize: {
        'h1': ['22px', { lineHeight: '1.2em', letterSpacing: '-1.5%', fontWeight: '700' }],
        'h2': ['18px', { lineHeight: '1.2em', letterSpacing: '-1.5%', fontWeight: '600' }],
        'h3': ['16px', { lineHeight: '1.2em', letterSpacing: '-1.5%', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '1.5em', letterSpacing: '-1.5%', fontWeight: '400' }],
        'body': ['16px', { lineHeight: '1.5em', letterSpacing: '-1.5%', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5em', letterSpacing: '-1.5%', fontWeight: '400' }],
        'caption': ['13px', { lineHeight: '1em', letterSpacing: '-1.5%', fontWeight: '400' }],
        'btn-primary': ['16px', { lineHeight: '1em', letterSpacing: '-1.5%', fontWeight: '600' }],
        'btn-secondary': ['14px', { lineHeight: '1em', letterSpacing: '-1.5%', fontWeight: '500' }],
      },
      // 간격 시스템
      spacing: {
        'xs': '4px',
        's': '8px',
        'm': '12px',
        'l': '16px',
        'xl': '24px',
        'xxl': '40px',
      },
      // 보더 반지름
      borderRadius: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '20px',
        'full': '9999px',
      },
      // 그림자
      boxShadow: {
        'card': '0px 0px 7px 0px rgba(51, 51, 51, 0.15)',
        'overlay': '0px 0px 7px 0px rgba(51, 51, 51, 0.15)',
      },
      // 애니메이션 지속 시간
      transitionDuration: {
        'fast': '200ms',
        'normal': '300ms',
      },
      // 컨테이너 크기
      maxWidth: {
        'mobile': '393px', // iPhone 16 기준
      },
      // 그리드 간격
      gap: {
        'grid-col': '8px',
        'grid-row': '16px',
      },
    },
  },
  plugins: [],
}

