---
inclusion: always
---

# 지하철 좌석 공유 앱 디자인 시스템

이 문서는 피그마 파일 `3ZddNZDr6sHbfFS8tkJP1m`에서 추출한 디자인 시스템 규칙을 정의합니다.

## 색상 시스템

### 주요 색상
- **Primary**: `#333333` (메인 텍스트, 스트로크)
- **Secondary**: `#C3C3C3` (보조 텍스트, 비활성 상태)
- **Background**: `#F8F8F8` (카드 배경)
- **White**: `#FFFFFF` (메인 배경)
- **Accent**: `#FFBF4C` (강조 색상)
- **Error/Alert**: `#FF1919` (에러, 경고)
- **Overlay**: `rgba(51, 51, 51, 0.5)` (모달 오버레이)

### 투명도 변형
- **Light Gray**: `rgba(195, 195, 195, 0.5)`
- **Background Overlay**: `rgba(255, 255, 255, 0.8)`
- **Border**: `rgba(0, 0, 0, 0.1)`
- **Shadow**: `rgba(51, 51, 51, 0.15)`

## 타이포그래피

### 폰트 패밀리
- **Primary**: Pretendard (한글)
- **Secondary**: Inter (영문, 숫자)

### 텍스트 스타일

#### 헤딩
- **H1**: Pretendard Bold 700, 22px, -1.5% letter-spacing
- **H2**: Pretendard SemiBold 600, 18px, -1.5% letter-spacing
- **H3**: Pretendard SemiBold 600, 16px, -1.5% letter-spacing

#### 본문
- **Body Large**: Pretendard Regular 400, 18px, line-height 1.5em, -1.5% letter-spacing
- **Body Medium**: Pretendard Regular 400, 16px, line-height 1.5em, -1.5% letter-spacing
- **Body Small**: Pretendard Regular 400, 14px, line-height 1.5em, -1.5% letter-spacing
- **Caption**: Pretendard Regular 400, 13px, -1.5% letter-spacing

#### 버튼 텍스트
- **Button Primary**: Pretendard SemiBold 600, 16px, -1.5% letter-spacing
- **Button Secondary**: Pretendard Medium 500, 14px, -1.5% letter-spacing

## 레이아웃 시스템

### 컨테이너
- **Mobile Width**: 393px (iPhone 16 기준)
- **Content Padding**: 16px (좌우)
- **Section Spacing**: 24px (상하)

### 간격 (Spacing)
- **XS**: 4px
- **S**: 8px  
- **M**: 12px
- **L**: 16px
- **XL**: 24px
- **XXL**: 40px

### 그리드
- **Column Gap**: 8px
- **Row Gap**: 16px
- **Card Padding**: 16px

## 컴포넌트 스타일

### 버튼
```css
/* Primary Button */
.btn-primary {
  background: #333333;
  color: #FFFFFF;
  padding: 16px;
  border-radius: 8px;
  font: Pretendard SemiBold 600 16px;
  letter-spacing: -1.5%;
}

/* Secondary Button */
.btn-secondary {
  background: #F8F8F8;
  color: #333333;
  padding: 12px 16px;
  border-radius: 8px;
  font: Pretendard Medium 500 14px;
}
```

### 카드
```css
.card {
  background: #FFFFFF;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0px 0px 7px 0px rgba(51, 51, 51, 0.15);
}
```

### 입력 필드
```css
.input-field {
  border: 1px solid #E3E3E3;
  border-radius: 8px;
  padding: 16px;
  font: Pretendard Regular 400 16px;
  background: #FFFFFF;
}

.input-field:focus {
  border-color: #333333;
  border-width: 2px;
}
```

### 라디오 버튼
```css
.radio-button {
  width: 24px;
  height: 24px;
  border: 1px solid #C3C3C3;
  border-radius: 50%;
}

.radio-button.selected {
  border-color: #333333;
  background: #333333;
}
```

## 아이콘 시스템

### 크기
- **Small**: 16px × 16px
- **Medium**: 24px × 24px  
- **Large**: 40px × 40px

### 스타일
- **Stroke Weight**: 1.5px
- **Color**: #333333 (기본), #C3C3C3 (비활성)

## 상태 시스템

### 인터랙션 상태
- **Default**: 기본 상태
- **Hover**: 약간의 투명도 변화 (0.8)
- **Active**: 색상 반전 또는 강조
- **Disabled**: #C3C3C3 색상, 50% 투명도

### 피드백
- **Success**: #00C851 (성공)
- **Warning**: #FFBF4C (경고)  
- **Error**: #FF1919 (에러)
- **Info**: #333333 (정보)

## 애니메이션

### 전환 효과
- **Duration**: 200ms (빠른 전환), 300ms (일반 전환)
- **Easing**: ease-out (자연스러운 감속)

### 모달/오버레이
- **Fade In**: opacity 0 → 1, 300ms
- **Slide Up**: transform translateY(100%) → 0, 300ms

## 반응형 규칙

### 브레이크포인트
- **Mobile**: 393px (기본)
- **Tablet**: 768px 이상
- **Desktop**: 1024px 이상

### 적응형 간격
- **Mobile**: 16px 패딩
- **Tablet**: 24px 패딩
- **Desktop**: 32px 패딩

## 접근성

### 색상 대비
- **텍스트**: 최소 4.5:1 대비율
- **UI 요소**: 최소 3:1 대비율

### 터치 타겟
- **최소 크기**: 44px × 44px
- **권장 크기**: 48px × 48px

### 포커스 상태
- **Outline**: 2px solid #333333
- **Offset**: 2px

이 디자인 시스템은 피그마 파일의 실제 디자인을 기반으로 하며, 모든 UI 구현 시 이 규칙을 준수해야 합니다.