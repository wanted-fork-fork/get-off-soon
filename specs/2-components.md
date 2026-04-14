# 공통 UI 컴포넌트

`src/components/ui/` 하위에 위치. 모든 컴포넌트는 NativeWind 클래스 기반으로 스타일링한다.

---

## TopBar

**파일**: `src/components/ui/TopBar.tsx`  
**크기**: 393×59  
**배경**: `#1B1D22`

```
[ 로고 ]           [ 마이페이지 ]  [ 알림 ]
```

### Props

```ts
interface TopBarProps {
  title?: string;          // 로고 대신 텍스트 제목 (온보딩 화면에서 사용 안 함)
  showBack?: boolean;      // 뒤로가기 아이콘 표시
  onBack?: () => void;
  rightActions?: ReactNode;
}
```

### 변형

| 상황 | 구성 |
|------|------|
| 메인 홈 | 로고(좌) + 마이페이지/알림(우) |
| 온보딩 | 뒤로가기 화살표(좌) 만, 우측 없음 |
| 착석 희망자 탐색 | 뒤로가기(좌) + 필터 아이콘(우) |

---

## ProgressBar

**파일**: `src/components/ui/ProgressBar.tsx`  
**위치**: TopBar 바로 아래  
**높이**: 7px

온보딩 진행 상태를 나타내는 두 겹 레이어:
- 트랙: `#272C35`, 전체 너비
- 채움: `#2D64D2`, 현재 단계 비율만큼

### Props

```ts
interface ProgressBarProps {
  current: number;   // 현재 단계 (1-based)
  total: number;     // 전체 단계 수
}
```

### 단계별 너비

| 역할 | 단계 | 화면 순서 |
|------|------|-----------|
| 곧 내려요 | 5단계 | 열차→역→칸→좌석→인상착의 |
| 앉고 싶어요 | 3단계 | 열차→역→칸 |

---

## Button

**파일**: `src/components/ui/Button.tsx`  
**높이**: 48px  
**보더 반지름**: 12px

### Props

```ts
interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  fullWidth?: boolean;
}
```

### 변형

| variant | 배경 | 텍스트 |
|---------|------|--------|
| `primary` | `#0094F7` | `#EEEEEF` |
| `secondary` | `#272B34` | `#E4E5E7` |
| `disabled` | `#272B34` (opacity 0.5) | `#797E86` |

바텀 버튼 영역 (Frame 224): 393×98, 배경 `#1B1D22`, 좌우 패딩 16px

---

## RoleCard

**파일**: `src/components/ui/RoleCard.tsx`  
**크기**: 361×86  
**배경**: `#262A30`  
**보더 반지름**: 12px

```
[ 제목 (22px/600, #E4E5E7) ]
[ 설명 (16px/400, #92969F) ]
```

### Props

```ts
interface RoleCardProps {
  title: string;         // "곧 내려요" | "앉고 싶어요"
  description: string;   // 부제목
  onPress: () => void;
  icon?: ReactNode;
}
```

---

## CarTabs

**파일**: `src/components/ui/CarTabs.tsx`  
**높이**: 48px  
**탭 너비**: 64px

탑승칸 번호 0~9를 수평 스크롤로 선택. Figma에서 5번 탭이 선택된 예시:
- 비활성: `#272B34` 배경 + `#C2C2C2` 텍스트
- 활성: `#2C63D2` 배경 + `#FFFFFF` 텍스트

### Props

```ts
interface CarTabsProps {
  selected: number | null;
  onSelect: (car: number) => void;
  cars?: number[];   // 기본값: [0,1,2,3,4,5,6,7,8,9]
}
```

레이아웃: `ScrollView horizontal` + `gap-2`

---

## PersonCard

**파일**: `src/components/ui/PersonCard.tsx`  
**너비**: 361px  
**배경**: `#262930`  
**보더 반지름**: 12px

착석 희망자 탐색 화면에서 하차 예정자 1명을 나타내는 카드.

### 구조 (접힌 상태, 173×높이)

```
[ 이름/익명 ] [ 남은 정거장 수 ]
[ 탑승칸 위치 ]
[ 좌석 구역 표시 ]
─────────────────────────
[ 인상착의 (선택) ]
```

### 구조 (펼친 상태, ~322×높이)

```
위 내용 +
[ 상세 좌석 구역 안내 ]
[ 인상착의 상세 ]
```

### Props

```ts
interface PersonCardProps {
  id: string;
  stopsRemaining: number;    // 남은 정거장
  carNumber: number;         // 탑승칸 번호
  seatZone: string;          // 좌석 구역 (예: "A구역")
  appearance?: string;       // 인상착의
  expanded?: boolean;
  onToggle?: () => void;
}
```

---

## 아이콘 컴포넌트

Figma에서 사용된 아이콘:
- `ic_arrow_left` (뒤로가기, 24×24) — 벡터 색상 `#797E85`
- 정렬 아이콘 (열차 진행 방향)
- 필터 아이콘 (열람 목록)

`@expo/vector-icons` 또는 SVG inline으로 구현.
