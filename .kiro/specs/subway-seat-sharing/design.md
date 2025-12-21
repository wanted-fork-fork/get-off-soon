# 설계 문서

## 개요

이 문서는 "곧 내려요" 지하철 좌석 공유 모바일 애플리케이션의 기술 아키텍처와 사용자 인터페이스 설계를 설명합니다. 승인된 요구사항을 기반으로 하며 Figma 프로토타입 분석 결과를 반영했습니다.

## 아키텍처 설계

### 시스템 아키텍처

```
┌─────────────────────────────────┐
│         모바일 앱                │
│      (React Native)             │
├─────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐│
│  │ 로컬 상태    │ │ 목업 데이터  ││
│  │ 관리        │ │ 서비스      ││
│  └─────────────┘ └─────────────┘│
│  ┌─────────────┐ ┌─────────────┐│
│  │ AsyncStorage│ │ 알림 시뮬레이션││
│  │ (로컬 저장) │ │ 서비스      ││
│  └─────────────┘ └─────────────┘│
└─────────────────────────────────┘
```

### 기술 스택

**프론트엔드:**
- React Native with Expo (크로스 플랫폼 모바일 개발)
- TypeScript (타입 안전성)
- React Navigation (화면 네비게이션)
- AsyncStorage (로컬 데이터 저장)
- React Context API (전역 상태 관리)
- React Native Notifications (로컬 알림)

**데이터 관리:**
- 목업 데이터 서비스 (실제 API 대신 사용)
- 로컬 상태 관리 (Redux 또는 Context API)
- AsyncStorage (사용자 설정 및 임시 데이터 저장)
- 시뮬레이션된 실시간 업데이트 (타이머 기반)

**개발 도구:**
- Expo Development Build
- React Native Debugger
- TypeScript 컴파일러
- ESLint + Prettier (코드 품질)

## 데이터 모델 및 목업 서비스

### 로컬 데이터 타입 정의

```typescript
// 사용자 정보 (로컬 저장)
interface User {
  id: string;
  nickname: string;
  contributionScore: number;
  level: number;
  createdAt: Date;
  lastActive: Date;
}

// 지하철 노선 정보 (정적 데이터)
interface SubwayLine {
  id: string;
  name: string;
  color: string;
  stations: Station[];
}

interface Station {
  id: string;
  name: string;
  order: number;
}

// 열차 정보 (시뮬레이션)
interface Train {
  id: string;
  lineId: string;
  trainNumber: string;
  direction: 'upbound' | 'downbound';
  currentStation: string;
  nextStation: string;
  estimatedArrival: Date;
}

// 좌석 정보 (로컬 상태)
interface SeatInfo {
  id: string;
  userId: string;
  trainId: string;
  carPosition: 'front' | 'middle' | 'back' | string;
  seatLocation: {
    x: number;
    y: number;
    description: string;
  };
  appearance: string;
  exitStation: string;
  isPublic: boolean;
  selectedUsers?: string[];
  waitingUsers: string[];
  createdAt: Date;
  expiresAt: Date;
}

// 대기 요청 (로컬 상태)
interface WaitingRequest {
  id: string;
  userId: string;
  trainId: string;
  targetSeatId: string;
  story?: string;
  boardingSegment: {
    from: string;
    to: string;
  };
  createdAt: Date;
}
```

### 목업 데이터 서비스

```typescript
// 지하철 노선 데이터 (정적)
class SubwayDataService {
  static getLines(): SubwayLine[] {
    // 서울 지하철 2호선 예시 데이터
    return [
      {
        id: 'line2',
        name: '2호선',
        color: '#00A84D',
        stations: [
          { id: 'gangnam', name: '강남', order: 1 },
          { id: 'yeoksam', name: '역삼', order: 2 },
          { id: 'seolleung', name: '선릉', order: 3 },
          // ... 더 많은 역
        ]
      }
    ];
  }
}

// 실시간 데이터 시뮬레이션
class MockRealtimeService {
  private static instance: MockRealtimeService;
  private listeners: Map<string, Function[]> = new Map();
  
  // 좌석 정보 업데이트 시뮬레이션
  simulateSeatUpdates() {
    setInterval(() => {
      // 랜덤하게 새로운 좌석 정보 생성
      // 기존 좌석 정보 만료 처리
      this.notifyListeners('seat_update', mockSeatData);
    }, 30000); // 30초마다
  }
  
  // 알림 시뮬레이션
  simulateNotifications() {
    setInterval(() => {
      // 하차 1-2정거장 전 알림 시뮬레이션
      this.notifyListeners('exit_alert', mockAlertData);
    }, 60000); // 1분마다
  }
}
```

## 사용자 인터페이스 설계

### 디자인 시스템

Figma 분석을 바탕으로 앱은 깔끔하고 현대적인 디자인을 따릅니다:

**색상 팔레트:**
- 주색상: 지하철 노선 색상 (선택된 노선에 따라 동적 변경)
- 보조색상: 배경용 중성 회색
- 강조색: 성공 상태용 녹색, 알림용 빨간색
- 텍스트: 밝은 배경에 고대비 진회색

**타이포그래피:**
- 헤더: 굵게, 18-20px
- 본문 텍스트: 보통, 14-16px
- 캡션: 가늘게, 12-14px
- 가독성을 위한 한국어 폰트 최적화

**컴포넌트:**
- 좌석 정보용 카드 기반 레이아웃
- 선택용 바텀 시트 모달
- 주요 액션용 플로팅 액션 버튼
- 메인 섹션용 탭 네비게이션

### 화면 플로우 설계

#### 1. 역할 선택 화면
```
┌─────────────────────────────┐
│        곧 내려요 🚉          │
├─────────────────────────────┤
│                             │
│  ┌─────────────────────┐    │
│  │   앉아있는 사람이에요   │    │
│  │      👤 💺          │    │
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │   앉고 싶은 사람이에요   │    │
│  │      🧍‍♂️ 🔍          │    │
│  └─────────────────────┘    │
│                             │
└─────────────────────────────┘
```

#### 2. 열차 선택 화면
```
┌─────────────────────────────┐
│    ← 2호선 선택              │
├─────────────────────────────┤
│  현재 위치: 강남역            │
│                             │
│  ┌─────────────────────┐    │
│  │  ↑ 상행 (을지로입구행)  │    │
│  │  🚇 2024호 열차       │    │
│  │  📍 2분 후 도착        │    │
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │  ↓ 하행 (잠실행)       │    │
│  │  🚇 2025호 열차       │    │
│  │  📍 4분 후 도착        │    │
│  └─────────────────────┘    │
└─────────────────────────────┘
```

#### 3. 좌석 정보 입력 화면 (앉아있는 사용자)
```
┌─────────────────────────────┐
│    ← 좌석 정보 입력          │
├─────────────────────────────┤
│  호차 선택:                  │
│  ○ 앞쪽  ● 중간  ○ 뒤쪽     │
│                             │
│  좌석 위치:                  │
│  [좌석 배치도 이미지]         │
│                             │
│  인상착의:                   │
│  ┌─────────────────────┐    │
│  │ 검정 패딩, 회색 백팩    │    │
│  └─────────────────────┘    │
│                             │
│  내릴 역: 역삼역 ▼           │
│                             │
│  ┌─────────────────────┐    │
│  │      정보 공유하기      │    │
│  └─────────────────────┘    │
└─────────────────────────────┘
```

#### 4. 사용 가능한 좌석 화면 (서있는 사용자)
```
┌─────────────────────────────┐
│    곧 내릴 사람 목록          │
├─────────────────────────────┤
│  ┌─────────────────────┐    │
│  │ 🚇 중간칸 | 👤 2명 대기 │    │
│  │ 검정 패딩, 회색 백팩      │    │
│  │ 📍 역삼역에서 하차       │    │
│  │ ⭐ 기여도 15점          │    │
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │ 🚇 앞쪽칸 | 👤 1명 대기  │    │
│  │ 흰색 셔츠, 검정 가방      │    │
│  │ 📍 선릉역에서 하차       │    │
│  │ ⭐ 기여도 8점           │    │
│  └─────────────────────┘    │
│                             │
│  + 내 사연 추가하기           │
└─────────────────────────────┘
```

## 실시간 기능 시뮬레이션

### 로컬 상태 관리

```typescript
// Context API를 사용한 전역 상태 관리
interface AppState {
  currentUser: User | null;
  currentTrain: Train | null;
  availableSeats: SeatInfo[];
  myWaitingRequests: WaitingRequest[];
  notifications: Notification[];
}

// 상태 업데이트 액션
type AppAction = 
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_TRAIN'; payload: Train }
  | { type: 'ADD_SEAT'; payload: SeatInfo }
  | { type: 'REMOVE_SEAT'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: Notification };
```

### 알림 시뮬레이션

**로컬 알림:**
- React Native Notifications를 사용한 푸시 알림 시뮬레이션
- 타이머 기반 하차 알림 (1-2정거장 전)
- 새로운 좌석 매칭 알림
- 기여도 점수 업데이트 알림

**인앱 알림:**
- 실시간 좌석 상태 업데이트 시뮬레이션
- 사용자 상호작용 피드백
- 연결 상태 표시기

### 데이터 동기화 시뮬레이션

```typescript
class DataSyncService {
  // 주기적으로 목업 데이터 업데이트
  startSync() {
    setInterval(() => {
      this.updateTrainPositions();
      this.expireOldSeats();
      this.generateRandomSeats();
    }, 15000); // 15초마다
  }
  
  // 열차 위치 시뮬레이션
  updateTrainPositions() {
    // 시간에 따라 열차가 다음 역으로 이동하는 시뮬레이션
  }
  
  // 만료된 좌석 정보 제거
  expireOldSeats() {
    // 하차역에 도착한 좌석 정보 자동 제거
  }
}
```

## 보안 및 개인정보 보호

### 데이터 보호
- 사용자 위치 데이터는 로컬에만 저장되며 앱 종료 시 자동 삭제
- 개인 외모 설명은 임시로 저장되며 좌석 인수인계 후 제거
- 사용자 사연과 기여도 점수는 사용자 동의 하에 로컬 저장

### 인증
- 익명 사용 가능, 선택적 계정 생성
- 디바이스 기반 사용자 식별 (재방문 사용자용)
- 로컬 세션 관리

### 개인정보 제어
- 사용자가 공개 또는 비공개 좌석 공유 선택 가능
- 사연 공유는 항상 선택사항
- 위치 추적은 앱 사용 중에만 활성화

## 성능 고려사항

### 최적화 전략
- 효율적인 열차 및 역 데이터 캐싱
- 활성 열차에 대해서만 실시간 업데이트
- 좌석 배치도 이미지 최적화
- 기여도 점수 백그라운드 동기화

### 확장성 준비
- 모듈화된 컴포넌트 구조로 향후 API 연동 용이
- 상태 관리 패턴으로 데이터 흐름 명확화
- 정적 자산 최적화 (지하철 노선도, 좌석 배치도)
- 러시아워 등 피크 사용 시간 대비 성능 최적화

## 접근성

### 포용적 설계
- 고대비 모드 지원
- 스크린 리더 호환성
- 큰 텍스트 옵션 (가독성 향상)
- 좌석 선택을 위한 음성 안내 지원
- 중요 알림에 대한 햅틱 피드백

### 국제화
- 한국어가 주 언어
- 외국인 사용자를 위한 영어 지원
- RTL 언어 지원 준비
- 좌석 공유 에티켓에 대한 문화적 고려사항

## 테스트 전략

### 단위 테스트
- 컴포넌트 렌더링 및 상호작용 테스트
- 목업 데이터 서비스 기능 테스트
- 실시간 이벤트 처리 테스트
- 데이터 모델 검증 테스트

### 통합 테스트
- 엔드투엔드 사용자 플로우 테스트
- 로컬 알림 연결 신뢰성 테스트
- 크로스 플랫폼 호환성 테스트
- 부하 상황에서의 성능 테스트

### 사용자 수용 테스트
- 타겟 사용자층 대상 사용성 테스트
- 보조 기술을 활용한 접근성 테스트
- 실제 지하철 환경에서의 테스트
- 피드백 수집 및 반복 개선 사이클