import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/constants/theme';
import { CarTabs } from '../src/components/ui/CarTabs';
import { PersonCard } from '../src/components/ui/PersonCard';
import { BottomSheet } from '../src/components/ui/BottomSheet';
import { Button } from '../src/components/ui/Button';
import { useJourney } from '../src/context/JourneyContext';
import { LINE_2_STATIONS, STATION_BY_NAME } from '../src/constants/subway';
import { SEAT_POSITION_TO_ZONE, getSeatZoneLabel } from '../src/constants/seatZone';
import {
  getMySeatRequest,
  getSharesForMyRequest,
  getMe,
  viewShareDetail,
  earlyExitSeatRequest,
  getSeatRequestsMeStatus,
  ViewShareDetailResponse,
} from '../src/api/generated';
import { ApiError } from '../src/api/client';
import { SosReportSheet } from '../src/components/ui/SosReportSheet';
import HomeIcon from '../assets/icons/Home.svg';
import SosIcon from '../assets/icons/Sos.svg';

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
  const [rewardSheetOpen, setRewardSheetOpen] = useState(false);
  const [pendingShareId, setPendingShareId] = useState<string | null>(null);
  const [rewardBalance, setRewardBalance] = useState<number | null>(null);
  const [viewing, setViewing] = useState(false);
  const [sosOpen, setSosOpen] = useState(false);

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
        console.log('[seat-seekers] getSharesForMyRequest response:', JSON.stringify(sharesRes, null, 2));
        if (cancelled) return;
        const flat: Share[] = [];
        const preViewed: Record<string, ViewShareDetailResponse> = {};
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
            if (s.appearance != null || s.seatPosition != null) {
              preViewed[s.id] = {
                shareId: s.id,
                appearance: s.appearance ?? undefined,
                seatPosition: s.seatPosition ?? undefined,
              };
            }
          }
        }
        setShares(flat);
        if (Object.keys(preViewed).length > 0) {
          setViewedDetails(prev => ({ ...prev, ...preViewed }));
          setExpandedId(prev => prev ?? Object.keys(preViewed)[0]);
        }
      } catch (err) {
        if (err instanceof ApiError) return;
        throw err;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [filterCar]);

  // 통합 상태 폴링 - 하차역 도착(완료) 시 자동으로 journey-end로 이동
  useEffect(() => {
    if (!state.requestId) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await getSeatRequestsMeStatus();
        if (cancelled) return;
        if (res.phase === 'completed' || res.phase === 'none') {
          reset();
          router.replace({ pathname: '/journey-end', params: { role: 'want-seat' } } as any);
        }
      } catch (err) {
        if (err instanceof ApiError) return;
      }
    };
    poll();
    const id = setInterval(poll, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [state.requestId]);

  const station = LINE_2_STATIONS.find(s => s.id === state.stationId);

  const sortedShares = [...shares].sort((a, b) => a.stopsAway - b.stopsAway);

  const handleToggleCar = (car: number) => {
    setFilterCar(car);
  };

  const handleTapShare = async (shareId: string) => {
    if (viewedDetails[shareId]) return;
    setPendingShareId(shareId);
    try {
      const me = await getMe();
      setRewardBalance(me.rewardPoints ?? 0);
    } catch {
      setRewardBalance(0);
    }
    setRewardSheetOpen(true);
  };

  const handleConfirmView = async () => {
    if (!pendingShareId) return;
    setViewing(true);
    try {
      const detail = await viewShareDetail(pendingShareId);
      console.log('[seat-seekers] viewShareDetail response:', JSON.stringify(detail, null, 2));
      setViewedDetails(prev => ({ ...prev, [pendingShareId!]: detail }));
      setExpandedId(pendingShareId);
      if (detail.rewardBalance != null) setRewardBalance(detail.rewardBalance);
      setRewardSheetOpen(false);
    } catch (err) {
      if (err instanceof ApiError) {
        Alert.alert('열람 실패', err.message);
      }
    } finally {
      setViewing(false);
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
      <View style={{ backgroundColor: colors.surface.DEFAULT, paddingHorizontal: 16, height: 59, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <TouchableOpacity onPress={() => router.replace('/')} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
          <HomeIcon width={24} height={24} />
        </TouchableOpacity>
        <Text style={{ position: 'absolute', left: 0, right: 0, textAlign: 'center', color: colors.fg.DEFAULT, fontSize: 17, fontWeight: '600', pointerEvents: 'none' }}>
          하차 예정자
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => setSosOpen(true)} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
            <SosIcon width={24} height={24} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/getting-off-list' as any)} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ gap: 4 }}>
              <View style={{ width: 18, height: 2, backgroundColor: colors.fg.DEFAULT, borderRadius: 1 }} />
              <View style={{ width: 18, height: 2, backgroundColor: colors.fg.DEFAULT, borderRadius: 1 }} />
              <View style={{ width: 18, height: 2, backgroundColor: colors.fg.DEFAULT, borderRadius: 1 }} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

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
            return (
              <PersonCard
                key={share.id}
                person={{
                  id: share.id,
                  stopsRemaining: share.stopsAway,
                  carNumber: share.carriage,
                  seatZone: '',
                  currentStation: share.boardStationName,
                  destinationStation: share.getOffStationName,
                  appearance: detail?.appearance,
                }}
                unlocked={!!detail}
                seatZoneLabel={
                  detail?.seatPosition != null
                    ? getSeatZoneLabel(SEAT_POSITION_TO_ZONE[detail.seatPosition] ?? null)
                    : undefined
                }
                seatZone={
                  detail?.seatPosition != null
                    ? SEAT_POSITION_TO_ZONE[detail.seatPosition]
                    : undefined
                }
                onPress={() => handleTapShare(share.id)}
              />
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

      <BottomSheet open={rewardSheetOpen} onClose={() => setRewardSheetOpen(false)} showHandle={false}>
        <Text style={{ color: colors.fg.DEFAULT, fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 16, lineHeight: 26 }}>
          1 리워드 사용하여 곧 내릴 사람의{'\n'}상세 위치와 인상착의를 확인하시겠어요?
        </Text>
        <Text style={{ color: colors.fg.muted, fontSize: 14, textAlign: 'center', marginBottom: 4 }}>
          사용한 리워드는 환불이 어려워요.
        </Text>
        <Text style={{ color: colors.fg.muted, fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
          (내 리워드 : {rewardBalance ?? '-'}개)
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Button label="돌아가기" variant="outline" onPress={() => setRewardSheetOpen(false)} />
          </View>
          <View style={{ flex: 1 }}>
            <Button label="네" onPress={handleConfirmView} disabled={viewing} />
          </View>
        </View>
      </BottomSheet>

      <SosReportSheet
        open={sosOpen}
        onClose={() => setSosOpen(false)}
        carNumbers={state.carNumbers}
      />
    </SafeAreaView>
  );
}
