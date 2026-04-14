# 구현 개요

Figma 섹션 `517:2714` ("최종") 기반 구현 계획.

## 앱 개요

지하철 착석 정보 공유 앱. 곧 내릴 승객이 자신의 자리 정보를 제공하면, 앉고 싶은 승객이 그 정보를 보고 해당 자리로 이동할 수 있도록 연결해준다.

## 두 가지 사용자 역할

| 역할 | 설명 | 플로우 |
|------|------|--------|
| **곧 내려요** | 곧 하차 예정인 사람. 자리 정보를 제공 | 열차→역→칸→좌석→인상착의 → 대기 |
| **앉고 싶어요** | 착석을 원하는 사람. 하차 예정자 목록 열람 | 열차→역→칸 → 목록 열람 |

## 기술 스택

- **프레임워크**: Expo (SDK 54) + React Native
- **라우팅**: expo-router (파일 기반)
- **스타일링**: NativeWind v4 (Tailwind CSS)
- **폰트**: Pretendard
- **SVG**: react-native-svg (노선도, 좌석 배치도)
- **상태 관리**: React Context (여정 온보딩 데이터)

## 파일 구조

```
app/
├── _layout.tsx
├── index.tsx                        # 메인 홈
├── (onboarding)/
│   ├── _layout.tsx                  # 뒤로가기 + 진행 바 공통 레이아웃
│   ├── select-line.tsx              # 열차 선택
│   ├── select-station.tsx           # 역 선택
│   ├── select-car.tsx               # 탑승칸 선택
│   ├── select-seat.tsx              # 좌석 구역 선택
│   └── appearance.tsx               # 인상착의 입력 (곧 내려요만)
├── seat-seekers.tsx                 # 착석 희망자 탐색 (곧 내려요 활성 여정)
├── getting-off-list.tsx             # 하차 예정자 목록 (앉고 싶어요 활성 여정)
└── journey-end.tsx                  # 여정 종료

src/
├── constants/
│   └── subway.ts                    # 2호선 역 목록 + 노선 데이터
├── types/
│   └── journey.ts                   # 타입 정의
├── context/
│   └── JourneyContext.tsx           # 여정 온보딩 상태
└── components/
    └── ui/
        ├── TopBar.tsx               # 공통 헤더
        ├── Button.tsx               # 버튼 (primary / secondary)
        ├── RoleCard.tsx             # 역할 선택 카드
        ├── CarTabs.tsx              # 탑승칸 탭 (0~9 수평 스크롤)
        ├── ProgressBar.tsx          # 온보딩 진행 바
        └── PersonCard.tsx           # 하차 예정자/착석 희망자 카드
```

## 구현 단계

| 단계 | 내용 | 관련 스펙 |
|------|------|-----------|
| 1 | 디자인 토큰 + 기반 설정 | `0-design-tokens.md` |
| 2 | 공통 UI 컴포넌트 | `0-components.md` |
| 3 | 온보딩 플로우 | `0-onboarding.md` |
| 4 | 메인 홈 + 활성 여정 화면 | `0-screens.md` |
| 5 | 여정 종료 | `0-screens.md` |
