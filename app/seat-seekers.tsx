import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/constants/theme';
import { TopBar } from '../src/components/ui/TopBar';
import { CarTabs } from '../src/components/ui/CarTabs';
import { Button } from '../src/components/ui/Button';
import { useJourney } from '../src/context/JourneyContext';
import { LINE_2_STATIONS, STATION_BY_NAME } from '../src/constants/subway';
import { SEAT_POSITION_TO_ZONE, getSeatZoneLabel } from '../src/constants/seatZone';
import {
  getMySeatRequest,
  getSharesForMyRequest,
  viewShareDetail,
  earlyExitSeatRequest,
  ViewShareDetailResponse,
} from '../src/api/generated';
import { ApiError } from '../src/api/client';

type Share = {
  id: string;
  boardStationName: string;
  getOffStationName: string;
  stopsAway: number;
  status: string;
  carriage: number;
};

export default function SeatSeekersScreen() {
  const router = useRouter();
  const { state, setRequestId, setTrainId, setStation, toggleCar, reset } = useJourney();
  const [filterCar, setFilterCar] = useState<number | null>(state.carNumbers[0] ?? null);
  const [shares, setShares] = useState<Share[]>([]);
  const [viewedDetails, setViewedDetails] = useState<Record<string, ViewShareDetailResponse>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const reqRes = await getMySeatRequest();
        if (reqRes && reqRes.id) {
          setRequestId(reqRes.id);
          if (!state.trainId && reqRes.trainId) {
            setTrainId(reqRes.trainId);
          }
          if (!state.stationId && reqRes.getOffStationName) {
            const station = STATION_BY_NAME[reqRes.getOffStationName];
            if (station) setStation(station.id);
          }
          if (state.carNumbers.length === 0 && reqRes.carriages) {
            for (const c of reqRes.carriages) toggleCar(c);
          }
          if (filterCar == null && reqRes.carriages?.length) {
            setFilterCar(reqRes.carriages[0]!);
          }
        }
      } catch (err) {
        if (err instanceof ApiError) return;
        throw err;
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (filterCar == null) return;
    let cancelled = false;
    (async () => {
      try {
        const sharesRes = await getSharesForMyRequest({ carriage: filterCar });
        if (cancelled) return;
        const flat: Share[] = [];
        for (const c of sharesRes.carriages ?? []) {
          for (const s of c.shares ?? []) {
            if (!s.id) continue;
            flat.push({
              id: s.id,
              boardStationName: s.boardStationName ?? '',
              getOffStationName: s.getOffStationName ?? '',
              stopsAway: s.stopsAway ?? 0,
              status: s.status ?? '',
              carriage: c.carriage ?? 0,
            });
          }
        }
        setShares(flat);
      } catch (err) {
        if (err instanceof ApiError) return;
        throw err;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [filterCar]);

  const station = LINE_2_STATIONS.find(s => s.id === state.stationId);

  const sortedShares = [...shares].sort((a, b) => a.stopsAway - b.stopsAway);

  const handleToggleCar = (car: number) => {
    setFilterCar(car);
  };

  const handleTapShare = async (shareId: string) => {
    if (expandedId === shareId) {
      setExpandedId(null);
      return;
    }
    if (viewedDetails[shareId]) {
      setExpandedId(shareId);
      return;
    }
    try {
      const detail = await viewShareDetail(shareId);
      setViewedDetails(prev => ({ ...prev, [shareId]: detail }));
      setExpandedId(shareId);
    } catch (err) {
      if (err instanceof ApiError) {
        Alert.alert('상세 열람 실패', err.message);
        return;
      }
      throw err;
    }
  };

  const handleEnd = async () => {
    if (ending) return;
    const endParams = { role: 'want-seat' };
    if (state.requestId) {
      setEnding(true);
      try {
        await earlyExitSeatRequest(state.requestId);
        reset();
        router.replace({ pathname: '/journey-end', params: endParams } as any);
      } catch (err) {
        if (err instanceof ApiError) {
          Alert.alert('처리 실패', err.message);
          return;
        }
        throw err;
      } finally {
        setEnding(false);
      }
      return;
    }
    router.replace({ pathname: '/journey-end', params: endParams } as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.DEFAULT }} edges={['top']}>
      <TopBar variant="back" onBack={() => router.back()} title="하차 예정자" />

      <View style={{ marginBottom: 40 }}>
        <Text style={{ color: colors.fg.muted, fontSize: 12, textAlign: 'right', paddingHorizontal: 16, marginBottom: 16 }}>
          열차 진행 방향 →
        </Text>
        <CarTabs selected={filterCar != null ? [filterCar] : []} onToggle={handleToggleCar} />
      </View>

      <View style={{ paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginBottom: 8 }}>
        <Text style={{ color: colors.fg.muted, fontSize: 13 }}>
          하차 가까운 순
        </Text>
        <Text style={{ color: colors.fg.muted, fontSize: 10 }}>▼</Text>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} contentContainerStyle={{ gap: 12, paddingBottom: 16 }}>
        {sortedShares.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 64 }}>
            <Text style={{ color: colors.fg.muted, fontSize: 16 }}>
              해당 칸에 하차 예정자가 없어요
            </Text>
          </View>
        ) : (
          sortedShares.map(share => {
            const isExpanded = expandedId === share.id;
            const detail = viewedDetails[share.id];
            const stopsLabel = share.stopsAway === 1 ? '다음 역 하차' : `${share.stopsAway}정거장 뒤`;
            const badgeColor = share.stopsAway === 1 ? '#E53935' : colors.fg.muted;
            const badgeBg = share.stopsAway === 1 ? '#FF191933' : '#202228';
            return (
              <Pressable
                key={share.id}
                onPress={() => handleTapShare(share.id)}
                style={{
                  borderRadius: 12,
                  backgroundColor: '#262A30',
                  borderWidth: 1,
                  borderColor: '#454A54',
                  overflow: 'hidden',
                }}
              >
                <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ color: '#9DA3AF', fontSize: 16, fontWeight: '600', letterSpacing: 16 * -0.015 }}>
                        {share.boardStationName}
                      </Text>
                      <Text style={{ color: colors.fg.muted, fontSize: 13 }}>
                        {share.carriage}호차
                      </Text>
                    </View>
                    <View style={{ backgroundColor: badgeBg, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 4 }}>
                      <Text style={{ color: badgeColor, fontSize: 12, fontWeight: '600' }}>
                        {stopsLabel}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ color: colors.fg.DEFAULT, fontSize: 18, fontWeight: '600', letterSpacing: 18 * -0.015 }}>
                    {share.getOffStationName}
                  </Text>
                  <Text style={{ color: colors.fg.muted, fontSize: 12, marginTop: 4 }}>
                    {share.status}
                  </Text>
                </View>

                {isExpanded && detail ? (
                  <View>
                    <View style={{ height: 1, backgroundColor: colors.divider, marginHorizontal: 16 }} />
                    <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 20, gap: 10 }}>
                      <View style={{ gap: 4 }}>
                        <Text style={{ color: colors.fg.muted, fontSize: 13 }}>좌석 위치</Text>
                        <Text style={{ color: colors.fg.DEFAULT, fontSize: 14, fontWeight: '600' }}>
                          {detail.seatPosition != null
                            ? getSeatZoneLabel(SEAT_POSITION_TO_ZONE[detail.seatPosition] ?? null)
                            : '정보 없음'}
                        </Text>
                      </View>
                      <View style={{ gap: 4 }}>
                        <Text style={{ color: colors.fg.muted, fontSize: 13 }}>인상착의</Text>
                        <Text style={{ color: colors.fg.DEFAULT, fontSize: 14, lineHeight: 20 }}>
                          {detail.appearance || '등록된 인상착의가 없습니다.'}
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : null}
              </Pressable>
            );
          })
        )}
      </ScrollView>

      <View style={{ backgroundColor: '#1B1D22', borderTopWidth: 1, borderTopColor: '#454A54', paddingHorizontal: 16, paddingBottom: 32, paddingTop: 12 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 2 }}>
            <Button label="먼저 내렸어요" onPress={handleEnd} variant="outline" disabled={ending} />
          </View>
          <View style={{ flex: 3 }}>
            <Button label="앉았어요" onPress={handleEnd} variant="primary" disabled={ending} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
