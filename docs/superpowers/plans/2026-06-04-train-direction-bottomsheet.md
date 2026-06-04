# 열차 선택 바텀시트 방면 탭 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `select-line.tsx`의 열차 선택 바텀시트를 방면(인접역) 탭 + 방면별 열차 라디오 목록 형태로 변경한다.

**Architecture:** 단일 파일(`app/(onboarding)/select-line.tsx`) 안에서 처리. 모듈 레벨 순수 헬퍼(인접역 계산, 방면 그룹핑, 상태 라벨/정렬)로 데이터를 가공하고, 컴포넌트는 `useMemo`로 탭을 만들어 렌더한다. SVG/히트존/`getTrainsByStation`/캐시/`useJourney`/`handleNext`는 그대로 둔다.

**Tech Stack:** React Native, Expo Router, TypeScript(strict). 테스트 러너 없음 → 검증은 `npx tsc --noEmit` + `npx expo lint` + 수동 확인.

> **TDD 예외:** 이 레포에는 jest 등 테스트 러너가 없고(`package.json` scripts = start/android/ios/web/lint), 단일 UI 파일 변경에 러너를 새로 도입하는 것은 범위를 벗어난다. 프로젝트 설정이 스킬 기본값보다 우선하므로 단위 테스트 대신 타입체크/린트/수동 검증을 사용한다.

---

## 참고: 검증된 API/데이터 사실

`GET /api/v1/subway/stations/{stationId}/trains` → `{ trains: [{ id, trainNo, direction("내선"/"외선"/지선 상·하행), terminalStationName, nextStationName, trainStatus, trainStatusCode(0~5,99), isExpress, isLastTrain }] }`. 응답에 방면 메타데이터는 trains 배열 밖에 없다. 열차가 있을 때 `nextStationName`은 선택역의 인접역과 일치한다(서울대입구 내선 → 낙성대). 따라서 탭 라벨은 `subway.ts`의 인접역으로 만들고, 열차 그룹은 `direction`으로 묶은 뒤 `nextStationName`으로 해당 인접역 탭에 배치한다.

## 파일 구조

- 수정: `app/(onboarding)/select-line.tsx` (유일한 변경 파일)
  - 상단 import 보강
  - 모듈 레벨: 상태 라벨/정렬/방면순서 상수, `DirectionTab` 타입, `getNeighbors`, `trainStatusLabel`, `statusProximity`, `buildDirectionTabs`
  - 컴포넌트: `selectedDirectionKey` state, `tabs` useMemo, 기본 탭 선택 effect, `selectedTab` 파생값
  - `BottomSheet` children 전체 교체

---

### Task 1: 데이터 레이어 (import · 헬퍼 · 상수)

**Files:**
- Modify: `app/(onboarding)/select-line.tsx`

- [ ] **Step 1: import 문 교체**

`select-line.tsx` 최상단 import 블록에서 react import와 subway import를 아래로 교체한다. (`STATION_BY_ID`는 더 이상 쓰지 않으므로 제거, `LINE_2_STATIONS` 추가, `useEffect`/`useMemo` 추가.)

```tsx
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../src/components/ui/Button';
import { BottomSheet } from '../../src/components/ui/BottomSheet';
import { useJourney } from '../../src/context/JourneyContext';
import { colors } from '../../src/constants/theme';
import { LINE_2_ID, LINE_2_STATIONS, STATION_BY_NAME } from '../../src/constants/subway';
import { getTrainsByStation, GetTrainsByStationResponse } from '../../src/api/generated';
import { ApiError } from '../../src/api/client';
import Line2Svg from '../../assets/icons/line_2.svg';
```

- [ ] **Step 2: 기존 `TRAIN_STATUS_LABEL` 블록을 상수 + 헬퍼 묶음으로 교체**

현재 파일의 아래 블록(주석 `// 서울 공공 API arvlCd 매핑 ...` 포함, `TRAIN_STATUS_LABEL` 객체 정의 전체)을 다음으로 교체한다. `type Train = ...` 줄은 그대로 두고, 그 아래에 위치시킨다.

기존:
```tsx
// 서울 공공 API arvlCd 매핑 (백엔드 trainStatus가 그대로 받아옴)
const TRAIN_STATUS_LABEL: Record<number, string> = {
  0: '당역 접근',
  1: '당역 도착',
  2: '출발',
  3: '전역 출발',
  4: '전역 진입',
  5: '전역 도착',
  99: '운행중',
};
```

교체:
```tsx
// trainStatusCode → 표시 라벨 (0진입 1도착 2출발 3전역출발 4전역진입 5전역도착 99운행중)
const TRAIN_STATUS_LABEL: Record<number, string> = {
  0: '당역 접근',
  1: '당역 도착',
  2: '당역 출발',
  3: '전역 출발',
  4: '전역 진입',
  5: '전역 도착',
  99: '운행중',
};

// 가까운 순 정렬 우선순위 (작을수록 역에 가까움)
const STATUS_PROXIMITY: Record<number, number> = {
  1: 0, // 당역 도착
  0: 1, // 당역 접근
  2: 2, // 당역 출발
  5: 3, // 전역 도착
  4: 4, // 전역 진입
  3: 5, // 전역 출발
  99: 6, // 운행중
};

// 본선 순환 구간 최대 order (성수/신정지선 제외)
const MAIN_LOOP_MAX_ORDER = 43;

type DirectionTab = {
  key: string;
  label: string;
  neighborName: string;
  trains: Train[];
};

function trainStatusLabel(train: Train): string {
  if (typeof train.trainStatusCode === 'number' && TRAIN_STATUS_LABEL[train.trainStatusCode]) {
    return TRAIN_STATUS_LABEL[train.trainStatusCode];
  }
  return train.trainStatus ?? `${train.trainNo ?? ''}열차`;
}

function statusProximity(train: Train): number {
  if (typeof train.trainStatusCode === 'number' && train.trainStatusCode in STATUS_PROXIMITY) {
    return STATUS_PROXIMITY[train.trainStatusCode];
  }
  return 99;
}

// 선택역의 양 옆 인접역 이름. 고정 순서 [다음역(order+1), 이전역(order-1)] → 목업의 탭 배치와 일치.
function getNeighbors(stationName: string): string[] {
  const station = STATION_BY_NAME[stationName];
  if (!station) return [];
  const order = station.order;
  const nameByOrder = (o: number) => LINE_2_STATIONS.find((s) => s.order === o)?.name;
  let nextName: string | undefined;
  let prevName: string | undefined;
  if (order <= MAIN_LOOP_MAX_ORDER) {
    nextName = nameByOrder((order % MAIN_LOOP_MAX_ORDER) + 1);
    prevName = nameByOrder(((order - 2 + MAIN_LOOP_MAX_ORDER) % MAIN_LOOP_MAX_ORDER) + 1);
  } else {
    nextName = nameByOrder(order + 1);
    prevName = nameByOrder(order - 1);
  }
  return [nextName, prevName].filter((n): n is string => !!n);
}

// 열차들을 방면 탭으로 가공. direction으로 그룹핑하고 nextStationName으로 인접역 탭에 배치,
// 열차 없는 인접역은 빈 탭으로 채운다. 인접역 고정 순서로 정렬해 최대 2개 반환.
function buildDirectionTabs(stationName: string, trains: Train[]): DirectionTab[] {
  const neighbors = getNeighbors(stationName);
  const orderIndex = (name: string) => {
    const i = neighbors.indexOf(name);
    return i === -1 ? neighbors.length : i;
  };

  const groups = new Map<string, Train[]>();
  for (const t of trains) {
    const key = t.direction ?? '';
    const arr = groups.get(key);
    if (arr) arr.push(t);
    else groups.set(key, [t]);
  }

  const usedNeighbors = new Set<string>();
  const tabs: DirectionTab[] = [];
  for (const groupTrains of groups.values()) {
    const matched = groupTrains
      .map((t) => t.nextStationName ?? '')
      .find((n) => neighbors.includes(n));
    const neighborName = matched ?? groupTrains[0]?.nextStationName ?? '';
    if (!neighborName) continue;
    const sorted = [...groupTrains].sort((a, b) => statusProximity(a) - statusProximity(b));
    tabs.push({ key: `tab-${neighborName}`, label: `${neighborName} 방향`, neighborName, trains: sorted });
    usedNeighbors.add(neighborName);
  }

  for (const name of neighbors) {
    if (!usedNeighbors.has(name)) {
      tabs.push({ key: `tab-${name}`, label: `${name} 방향`, neighborName: name, trains: [] });
    }
  }

  tabs.sort((a, b) => orderIndex(a.neighborName) - orderIndex(b.neighborName));
  return tabs.slice(0, 2);
}
```

- [ ] **Step 3: 타입체크**

Run: `npx tsc --noEmit`
Expected: 통과 (이 시점엔 새 헬퍼가 아직 미사용일 수 있으나 strict에 noUnusedLocals 미설정이라 에러 없음). 만약 `STATION_BY_ID` 제거로 인한 "사용되지 않음"이 아닌 "정의되지 않음" 에러가 나면, 다음 Task에서 해당 참조를 제거하므로 Task 3까지 마친 뒤 재확인.

---

### Task 2: 컴포넌트 상태/파생값

**Files:**
- Modify: `app/(onboarding)/select-line.tsx`

- [ ] **Step 1: state에 `selectedDirectionKey` 추가**

`SelectLineScreen` 컴포넌트 내 기존 useState 묶음에 한 줄 추가한다.

기존:
```tsx
  const [selectedTrain, setSelectedTrain] = useState<string | null>(null);
  const [tappedStation, setTappedStation] = useState<string | null>(null);
```

교체:
```tsx
  const [selectedTrain, setSelectedTrain] = useState<string | null>(null);
  const [selectedDirectionKey, setSelectedDirectionKey] = useState<string | null>(null);
  const [tappedStation, setTappedStation] = useState<string | null>(null);
```

- [ ] **Step 2: 탭 파생값 + 기본 선택 effect 추가**

`handleNext` 함수 정의 바로 위(또는 `const svgWidth = ...` 위)에 다음을 추가한다.

```tsx
  const tabs = useMemo(
    () => (tappedStation ? buildDirectionTabs(tappedStation, trains) : []),
    [tappedStation, trains],
  );

  // 탭이 새로 만들어지면 열차가 있는 방면을 우선 기본 선택
  useEffect(() => {
    if (tabs.length === 0) {
      setSelectedDirectionKey(null);
      return;
    }
    const withTrains = tabs.find((t) => t.trains.length > 0);
    setSelectedDirectionKey((withTrains ?? tabs[0]).key);
  }, [tabs]);

  const selectedTab = tabs.find((t) => t.key === selectedDirectionKey) ?? tabs[0] ?? null;
```

- [ ] **Step 3: 타입체크**

Run: `npx tsc --noEmit`
Expected: 통과. (이 시점에 기존 render의 `STATION_BY_ID` 참조가 남아 있으면 "Cannot find name 'STATION_BY_ID'" 에러가 날 수 있다 → Task 3에서 해당 render를 통째로 교체하며 제거됨. Task 3 후 최종 확인.)

---

### Task 3: 바텀시트 렌더 교체

**Files:**
- Modify: `app/(onboarding)/select-line.tsx`

- [ ] **Step 1: `<BottomSheet> ... </BottomSheet>` 블록 전체 교체**

현재 파일의 `<BottomSheet open={sheetOpen} ...>` 부터 닫는 `</BottomSheet>` 까지(약 188~280행) 전체를 아래로 교체한다.

```tsx
      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        {tappedStation && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: colors.line[2],
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 8,
              }}
            >
              <Text style={{ color: colors.white, fontSize: 12, fontWeight: '700' }}>2</Text>
            </View>
            <Text style={{ color: colors.fg.DEFAULT, fontSize: 17, fontWeight: '600' }}>
              {tappedStation}
            </Text>
          </View>
        )}

        {loadingTrains ? (
          <View style={{ paddingVertical: 32, alignItems: 'center' }}>
            <ActivityIndicator color={colors.accent.blue} />
          </View>
        ) : !selectedTab ? (
          <View>
            <Text style={{ color: colors.fg.DEFAULT, fontSize: 15, lineHeight: 22, marginBottom: 24 }}>
              도착 예정이거나 도착한 열차가 없습니다.{'\n'}열차가 역에 있을 때 다시 시도해주세요.
            </Text>
            <Button label="닫기" onPress={() => setSheetOpen(false)} />
          </View>
        ) : (
          <>
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: colors.surface.input,
                borderRadius: 10,
                padding: 4,
                marginBottom: 16,
              }}
            >
              {tabs.map((tab) => {
                const active = tab.key === selectedTab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    activeOpacity={0.8}
                    onPress={() => {
                      setSelectedDirectionKey(tab.key);
                      setSelectedTrain(null);
                    }}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 8,
                      alignItems: 'center',
                      backgroundColor: active ? colors.accent.blue : 'transparent',
                    }}
                  >
                    <Text
                      style={{
                        color: active ? colors.white : colors.fg.muted,
                        fontSize: 14,
                        fontWeight: '600',
                      }}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {selectedTab.trains.length === 0 ? (
              <View>
                <Text
                  style={{
                    color: colors.fg.secondary,
                    fontSize: 14,
                    lineHeight: 21,
                    textAlign: 'center',
                    paddingVertical: 28,
                  }}
                >
                  도착 예정이거나 도착한 열차가 없습니다.{'\n'}열차가 역에 있을 때 다시 시도해주세요.
                </Text>
                <Button label="닫기" onPress={() => setSheetOpen(false)} />
              </View>
            ) : (
              <>
                <View style={{ gap: 10, marginBottom: 24 }}>
                  {selectedTab.trains.map((train) => {
                    const trainId = train.id ?? '';
                    const selected = selectedTrain === trainId;
                    return (
                      <TouchableOpacity
                        key={trainId}
                        activeOpacity={0.8}
                        onPress={() => setSelectedTrain(trainId)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingHorizontal: 16,
                          paddingVertical: 16,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: selected ? colors.accent.blue : 'transparent',
                          backgroundColor: colors.surface.input,
                        }}
                      >
                        <View
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 9,
                            borderWidth: 1.5,
                            borderColor: selected ? colors.accent.blue : colors.fg.muted,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                          }}
                        >
                          {selected && (
                            <View
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: 5,
                                backgroundColor: colors.accent.blue,
                              }}
                            />
                          )}
                        </View>
                        <Text style={{ color: colors.fg.DEFAULT, fontSize: 15, fontWeight: '600' }}>
                          {trainStatusLabel(train)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Button label="다음" onPress={handleNext} disabled={!selectedTrain} />
              </>
            )}
          </>
        )}
      </BottomSheet>
```

- [ ] **Step 2: 최종 타입체크**

Run: `npx tsc --noEmit`
Expected: PASS (에러 없음). `STATION_BY_ID` 미정의/미사용 에러가 없어야 한다.

- [ ] **Step 3: 린트**

Run: `npx expo lint`
Expected: 신규 에러 없음.

---

### Task 4: 수동 검증 & 커밋

**Files:**
- Modify: `app/(onboarding)/select-line.tsx`

- [ ] **Step 1: 앱 실행 후 3케이스 확인**

`npx expo start` → "현재 타고 있는 열차를 선택해주세요" 화면에서 역(예: 서울대입구) 탭.
- 양 방면 모두 열차: 탭 2개(예: 봉천 방향 / 낙성대 방향), 각 방면 열차가 상태 라벨로 나열, 가까운 순. `다음`은 미선택 시 비활성.
- 한 방면만 열차: 빈 방면 탭 선택 시 "도착 예정이거나 ..." 문구 + `닫기`. 열차 있는 방면이 기본 선택됨.
- 양쪽 다 열차 0대: 두 빈 탭(인접역 이름) 또는(인접역 못 구하면) 단일 빈 상태 + `닫기`.
- 탭 전환 시 선택 해제 + `다음` 비활성 복귀.

- [ ] **Step 2: 커밋**

```bash
git add "app/(onboarding)/select-line.tsx" docs/superpowers/plans/2026-06-04-train-direction-bottomsheet.md
git commit -m "feat: 열차 선택 바텀시트 방면 탭 UI 추가

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

> 주의: 작업 트리에 기존 변경(`CLAUDE.md`, `getting-off-status.tsx`, `withdraw.tsx`)이 있다. 위 `git add`는 해당 두 파일만 명시적으로 스테이징하므로 기존 변경은 건드리지 않는다.
