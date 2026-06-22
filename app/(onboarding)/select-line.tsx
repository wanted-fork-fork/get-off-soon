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

type Connection = NonNullable<GetTrainsByStationResponse['connections']>[number];
type Train = NonNullable<Connection['trains']>[number];

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

// 연결(다음역)별 connection을 방면 탭으로 가공. 각 connection이 곧 하나의 방면이므로
// nextStationName으로 탭을 만들고, 열차 없는(hasTrains=false) 방면도 빈 탭으로 그대로 노출한다.
// 인접역 고정 순서로 정렬해 최대 2개 반환.
function buildDirectionTabs(stationName: string, connections: Connection[]): DirectionTab[] {
  const neighbors = getNeighbors(stationName);
  const orderIndex = (name: string) => {
    const i = neighbors.indexOf(name);
    return i === -1 ? neighbors.length : i;
  };

  const usedNeighbors = new Set<string>();
  const tabs: DirectionTab[] = [];
  for (const conn of connections) {
    const neighborName = conn.nextStationName ?? '';
    if (!neighborName) continue;
    const sorted = [...(conn.trains ?? [])].sort((a, b) => statusProximity(a) - statusProximity(b));
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

// 같은 역을 짧은 시간에 다시 탭해도 다시 호출하지 않도록 모듈 레벨 캐시 (1분 TTL)
const TRAINS_CACHE_TTL_MS = 60_000;
const trainsByStationCache = new Map<string, { connections: Connection[]; ts: number }>();

const SVG_VIEWBOX = { x: 0, y: 0, w: 1120, h: 588 };
const SVG_ASPECT = SVG_VIEWBOX.w / SVG_VIEWBOX.h;

type Station = { cx: number; cy: number; name: string };
const STATIONS: Station[] = [
  { cx: 909.5, cy: 33.3, name: '용두' },
  { cx: 869, cy: 41, name: '신설동' },
  { cx: 997.5, cy: 56, name: '신답' },
  { cx: 343.5, cy: 109, name: '이대' },
  { cx: 385.5, cy: 109, name: '아현' },
  { cx: 533, cy: 109, name: '을지로입구' },
  { cx: 838, cy: 109, name: '상왕십리' },
  { cx: 432, cy: 112, name: '충정로' },
  { cx: 480, cy: 112, name: '시청' },
  { cx: 586, cy: 112, name: '을지로3가' },
  { cx: 644, cy: 112, name: '을지로4가' },
  { cx: 714, cy: 112, name: '동대문역사문화공원' },
  { cx: 779, cy: 112, name: '신당' },
  { cx: 889, cy: 112, name: '왕십리' },
  { cx: 310.5, cy: 122, name: '신촌' },
  { cx: 938.5, cy: 123, name: '한양대' },
  { cx: 997.5, cy: 135, name: '용답' },
  { cx: 282, cy: 149, name: '홍대입구' },
  { cx: 966.5, cy: 150, name: '뚝섬' },
  { cx: 95, cy: 171, name: '까치산' },
  { cx: 994, cy: 182, name: '성수' },
  { cx: 248, cy: 186, name: '합정' },
  { cx: 994, cy: 228, name: '건대입구' },
  { cx: 247, cy: 236, name: '당산' },
  { cx: 104.5, cy: 251, name: '신정네거리' },
  { cx: 997.5, cy: 264, name: '구의' },
  { cx: 152.5, cy: 299, name: '양천구청' },
  { cx: 997.5, cy: 300, name: '강변' },
  { cx: 247, cy: 305, name: '영등포구청' },
  { cx: 997.5, cy: 340, name: '잠실나루' },
  { cx: 251.5, cy: 347, name: '문래' },
  { cx: 201.5, cy: 349, name: '도림천' },
  { cx: 994, cy: 384, name: '잠실' },
  { cx: 247, cy: 398, name: '신도림' },
  { cx: 997.5, cy: 417, name: '잠실새내' },
  { cx: 994, cy: 466, name: '종합운동장' },
  { cx: 247, cy: 467, name: '대림' },
  { cx: 959.5, cy: 501, name: '삼성' },
  { cx: 290.5, cy: 504, name: '구로디지털단지' },
  { cx: 367.5, cy: 537, name: '신대방' },
  { cx: 473.5, cy: 537, name: '봉천' },
  { cx: 525.5, cy: 537, name: '서울대입구' },
  { cx: 582.5, cy: 537, name: '낙성대' },
  { cx: 669.5, cy: 537, name: '방배' },
  { cx: 713.5, cy: 537, name: '서초' },
  { cx: 865.5, cy: 537, name: '역삼' },
  { cx: 422, cy: 540, name: '신림' },
  { cx: 620, cy: 540, name: '사당' },
  { cx: 755, cy: 540, name: '교대' },
  { cx: 821, cy: 540, name: '강남' },
  { cx: 898, cy: 540, name: '선릉' },
];

const HIT_W = 50;
const HIT_H = 50;

export default function SelectLineScreen() {
  const router = useRouter();
  const { setLine, setTrainId } = useJourney();
  const [contentHeight, setContentHeight] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState<string | null>(null);
  const [selectedDirectionKey, setSelectedDirectionKey] = useState<string | null>(null);
  const [tappedStation, setTappedStation] = useState<string | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loadingTrains, setLoadingTrains] = useState(false);

  const handleStationTap = async (name: string) => {
    const station = STATION_BY_NAME[name];
    setTappedStation(name);
    setSelectedTrain(null);
    setSheetOpen(true);
    if (!station) {
      setConnections([]);
      return;
    }

    const cached = trainsByStationCache.get(station.id);
    if (cached && Date.now() - cached.ts < TRAINS_CACHE_TTL_MS) {
      setConnections(cached.connections);
      setLoadingTrains(false);
      return;
    }

    setConnections([]);
    setLoadingTrains(true);
    try {
      const res = await getTrainsByStation(station.id);
      console.log(
        `[select-line] getTrainsByStation(${station.id} / ${name})`,
        'connections.length =', res.connections?.length ?? 0,
        '\nraw response =', JSON.stringify(res, null, 2),
      );
      const conns = res.connections ?? [];
      trainsByStationCache.set(station.id, { connections: conns, ts: Date.now() });
      setConnections(conns);
    } catch (err) {
      if (err instanceof ApiError) {
        Alert.alert('열차 정보를 불러오지 못했어요', err.message);
      }
      setSheetOpen(false);
    } finally {
      setLoadingTrains(false);
    }
  };

  const tabs = useMemo(
    () => (tappedStation ? buildDirectionTabs(tappedStation, connections) : []),
    [tappedStation, connections],
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

  const handleNext = () => {
    if (!selectedTrain) return;
    setLine(LINE_2_ID);
    setTrainId(selectedTrain);
    setSheetOpen(false);
    router.push('/(onboarding)/select-station' as any);
  };

  const svgWidth = contentHeight * SVG_ASPECT;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface.DEFAULT }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 32, paddingBottom: 16 }}>
        <Text style={{ color: colors.fg.DEFAULT, fontSize: 18, fontWeight: '600' }}>
          현재 타고 있는 열차를 선택해주세요.
        </Text>
      </View>

      <View style={{ flex: 1, paddingBottom: 60 }}>
        <View
          style={{ flex: 1 }}
          onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
        >
          {contentHeight > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ alignItems: 'center' }}
            >
              <View style={{ width: svgWidth, height: contentHeight }}>
                <Line2Svg
                  width={svgWidth}
                  height={contentHeight}
                  viewBox={`${SVG_VIEWBOX.x} ${SVG_VIEWBOX.y} ${SVG_VIEWBOX.w} ${SVG_VIEWBOX.h}`}
                />
                {STATIONS.map((s, i) => {
                  const scale = contentHeight / SVG_VIEWBOX.h;
                  const x = s.cx * scale - HIT_W / 2;
                  const y = s.cy * scale - HIT_H / 2;
                  return (
                    <Pressable
                      key={i}
                      onPress={() => handleStationTap(s.name)}
                      style={{ position: 'absolute', left: x, top: y, width: HIT_W, height: HIT_H }}
                    />
                  );
                })}
              </View>
            </ScrollView>
          )}
        </View>
      </View>

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
                <View style={{ minHeight: 184, justifyContent: 'center' }}>
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
                </View>
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
    </View>
  );
}
