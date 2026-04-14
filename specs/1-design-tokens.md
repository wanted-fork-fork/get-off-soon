# 디자인 토큰

Figma 섹션 `517:2714`에서 추출한 값. `tailwind.config.js`를 아래 기준으로 전면 교체한다.

> 현재 `tailwind.config.js`는 라이트 테마로 작성되어 있으나, Figma 디자인은 **다크 테마**다.

## 색상

### 배경

| 토큰 | Hex | 용도 |
|------|-----|------|
| `background.DEFAULT` | `#1B1D22` | 페이지 기본 배경 |
| `background.card` | `#262A30` | 카드, 컨테이너 배경 |
| `background.input` | `#272B34` | 인풋, 비활성 탭 |
| `background.deep` | `#0F1113` | 최근 여정 카드, 바텀 바 |
| `background.overlay` | `rgba(0,0,0,0.5)` | 모달 오버레이 |

### 텍스트

| 토큰 | Hex | 용도 |
|------|-----|------|
| `text.primary` | `#E4E5E7` | 본문, 제목 |
| `text.secondary` | `#92969F` | 보조 설명 텍스트 |
| `text.muted` | `#797E86` | 비활성, 힌트 |
| `text.inactive` | `#C2C2C2` | 비활성 탭 텍스트 |

### 액센트

| 토큰 | Hex | 용도 |
|------|-----|------|
| `accent.blue` | `#0094F7` | 주요 CTA 버튼 |
| `accent.tab` | `#2C63D2` | 활성 탭 배경 |
| `accent.link` | `#7BA7FF` | 링크, 경로 강조 |

### 노선 색상

| 토큰 | Hex | 용도 |
|------|-----|------|
| `line.2` | `#00A44A` | 2호선 |

### 기타

| 토큰 | Hex | 용도 |
|------|-----|------|
| `border.DEFAULT` | `rgba(255,255,255,0.08)` | 카드 테두리 |
| `progress.track` | `#272C35` | 진행 바 트랙 |
| `progress.fill` | `#2D64D2` | 진행 바 채움 |

## 타이포그래피

폰트 패밀리: **Pretendard**

| 토큰 | size / weight | 용도 |
|------|--------------|------|
| `h1` | 22px / 600 | 주요 제목 (역할 카드 등) |
| `h2` | 18px / 600 | 화면 타이틀, 여정 종료 |
| `h3` | 16px / 600 | 섹션 제목, 활성 탭 |
| `body` | 16px / 400 | 일반 본문 |
| `body-sm` | 14px / 600 | 노선/역 이름, 경로 표시 |
| `caption` | 13px / 400 | 보조 라벨, 정렬 기준 |

letter-spacing: `-0.24px` (전체 공통)

## 간격 시스템

| 토큰 | 값 | 용도 |
|------|-----|------|
| `spacing.xs` | 4px | 아이콘 내부 패딩 |
| `spacing.s` | 8px | 카드 내부 소간격 |
| `spacing.m` | 12px | 컴포넌트 내부 |
| `spacing.l` | 16px | 카드 패딩, 섹션 간격 |
| `spacing.xl` | 24px | 화면 수평 패딩 |
| `spacing.xxl` | 40px | 섹션 상단 여백 |

화면 좌우 여백: `16px` (전체 페이지 공통)

## 보더 반지름

| 토큰 | 값 |
|------|-----|
| `rounded.sm` | 8px |
| `rounded.md` | 12px |
| `rounded.lg` | 16px |
| `rounded.full` | 9999px |

## 컴포넌트 크기

| 컴포넌트 | 크기 |
|----------|------|
| 상단 바 (TopBar) | 393×59 |
| 역할 카드 (RoleCard) | 361×86 |
| CTA 버튼 | 361×48 (혹은 211+) |
| 탑승칸 탭 한 칸 | 64×48 |
| 하차 예정자 카드 | 361×173 (기본), 361×322 (확장) |
| 바텀 버튼 영역 | 393×98 |

## tailwind.config.js 변경 요약

```js
colors: {
  background: {
    DEFAULT: '#1B1D22',
    card: '#262A30',
    input: '#272B34',
    deep: '#0F1113',
  },
  text: {
    primary: '#E4E5E7',
    secondary: '#92969F',
    muted: '#797E86',
    inactive: '#C2C2C2',
  },
  accent: {
    blue: '#0094F7',
    tab: '#2C63D2',
    link: '#7BA7FF',
  },
  line: {
    2: '#00A44A',
  },
  progress: {
    track: '#272C35',
    fill: '#2D64D2',
  },
}
```
