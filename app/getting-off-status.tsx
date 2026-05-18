import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Linking, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useJourney } from '../src/context/JourneyContext';
import { colors } from '../src/constants/theme';
import { getSeatZoneLabel, SEAT_POSITION_TO_ZONE } from '../src/constants/seatZone';
import { STATION_BY_ID, STATION_BY_NAME, LINE_2_STATIONS, LINE_2_ID } from '../src/constants/subway';
import { Button } from '../src/components/ui/Button';
import { getMySeatShare, earlyExitSeatShare, getTrainsByLine } from '../src/api/generated';
import { ApiError } from '../src/api/client';
import CallIcon from '../assets/icons/Call.svg';
import EmailIcon from '../assets/icons/Email.svg';
import TrainIcon from '../assets/icons/Train.svg';
import EditIcon from '../assets/icons/Edit.svg';

function EditButton({ onPress }: { onPress?: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ padding: 8 }}>
      <EditIcon width={20} height={20} />
    </TouchableOpacity>
  );
}

const HEADER_HEIGHT = 280;
const FOOTER_HEIGHT = 72;

export default function GettingOffStatusScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { state, setTrainId, setStation, toggleCar, setSeatZone, setAppearance, setShareId, reset } = useJourney();
  const [ending, setEnding] = useState(false);
  const [boardStationName, setBoardStationName] = useState<string | null>(null);
  const [currentStationId, setCurrentStationId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getMySeatShare();
        if (!res) return;
        setShareId(res.id!);
        if (res.boardStationName) setBoardStationName(res.boardStationName);
        if (!state.trainId && res.trainId) {
          setTrainId(res.trainId);
        }
        if (!state.stationId && res.getOffStationName) {
          const found = LINE_2_STATIONS.find((s) => s.name === res.getOffStationName);
          if (found) setStation(found.id);
        }
        if (state.carNumbers.length === 0 && res.carriages) {
          for (const n of res.carriages) {
            toggleCar(n);
          }
        }
        if (!state.seatZone && typeof res.seatPosition === 'number') {
          setSeatZone(SEAT_POSITION_TO_ZONE[res.seatPosition]);
        }
        if (!state.appearance && res.appearance) {
          setAppearance(res.appearance);
        }
      } catch (err) {
        if (err instanceof ApiError) return;
      }
    })();
  }, []);

  useEffect(() => {
    if (!state.trainId) return;
    let cancelled = false;
    const fetchPos = async () => {
      try {
        const res = await getTrainsByLine(LINE_2_ID);
        if (cancelled) return;
        const train = res.trains?.find((t) => t.id === state.trainId);
        if (train?.currentStationId) setCurrentStationId(train.currentStationId);
      } catch (err) {
        if (err instanceof ApiError) return;
      }
    };
    fetchPos();
    const id = setInterval(fetchPos, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [state.trainId]);

  const boardStation = boardStationName ? STATION_BY_NAME[boardStationName] : null;
  const getOffStation = state.stationId ? STATION_BY_ID[state.stationId] : null;
  const currentStation = currentStationId ? STATION_BY_ID[currentStationId] : null;

  let progressPct = 0;
  let stationsRemaining = 0;
  if (boardStation && getOffStation) {
    const total = Math.abs(getOffStation.order - boardStation.order);
    if (currentStation && total > 0) {
      const direction = getOffStation.order >= boardStation.order ? 1 : -1;
      const traveled = (currentStation.order - boardStation.order) * direction;
      progressPct = Math.max(0, Math.min(1, traveled / total));
      stationsRemaining = Math.max(0, total - Math.max(0, traveled));
    } else {
      stationsRemaining = total;
    }
  }

  const AVG_MIN_PER_STATION = 2;
  const eta = new Date(Date.now() + stationsRemaining * AVG_MIN_PER_STATION * 60_000);
  const timeStr = currentStation
    ? `${String(eta.getHours()).padStart(2, '0')}:${String(eta.getMinutes()).padStart(2, '0')}`
    : '--:--';

  const sortedCarriages = [...state.carNumbers].sort((a, b) => a - b);
  const carLabel = sortedCarriages.length > 0
    ? sortedCarriages.join('·') + '호차'
    : '미선택';

  const boardName = boardStation?.name ?? '출발역';
  const getOffName = getOffStation?.name ?? '도착역';
  const progressPctLabel: `${number}%` = `${Math.round(progressPct * 100)}%`;

  // 공유 상태 폴링 - 완료되면 자동으로 journey-end로 이동
  useEffect(() => {
    if (!state.shareId) return;
    let cancelled = false;
    const checkShare = async () => {
      try {
        const res = await getMySeatShare();
        if (cancelled) return;
        const isDone = !res || (res.status != null && res.status !== 'ACTIVE');
        if (isDone) {
          reset();
          router.replace({
            pathname: '/journey-end',
            params: { endedBoard: boardName, endedGetOff: getOffName },
          } as any);
        }
      } catch (err) {
        if (err instanceof ApiError) return;
      }
    };
    const id = setInterval(checkShare, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [state.shareId, boardName, getOffName]);

  const handleEnd = async () => {
    if (ending) return;
    const endParams = { endedBoard: boardName, endedGetOff: getOffName };
    if (state.shareId) {
      setEnding(true);
      try {
        await earlyExitSeatShare(state.shareId);
        reset();
        router.replace({ pathname: '/journey-end', params: endParams } as any);
      } catch (err) {
        if (err instanceof ApiError) {
          Alert.alert('처리 실패', err.message);
        }
      } finally {
        setEnding(false);
      }
    } else {
      router.replace({ pathname: '/journey-end', params: endParams } as any);
    }
  };

  const sheetMinHeight = Math.max(0, windowHeight - insets.top - HEADER_HEIGHT);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#262A30' }} edges={['top']}>
      {/* 헤더 콘텐츠 - absolute, ScrollView 뒤에 그려짐 */}
      <View style={{ position: 'absolute', top: insets.top, left: 0, right: 0, height: HEADER_HEIGHT }}>
        <View style={{ height: 64 }} />
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <Text style={{ color: colors.fg.DEFAULT, fontSize: 28, fontWeight: '700', marginBottom: 8 }}>
            {timeStr} 하차 예정
          </Text>
          <Text style={{ color: colors.fg.muted, fontSize: 14, marginBottom: 32 }}>
            착석 희망자에게 내 하차 정보가 공유되고 있어요.
          </Text>

          <View style={{ marginTop: 32, marginBottom: 24, marginHorizontal: 32 - 24, height: 80 }}>
            <TrainIcon
              width={73}
              height={32}
              style={{ position: 'absolute', top: 8, left: progressPctLabel, marginLeft: -73 / 2, zIndex: 2 }}
            />
            <View style={{ position: 'absolute', left: 0, right: 0, top: 38, height: 6, backgroundColor: '#434B5B', borderRadius: 3 }}>
              <View style={{ height: 6, width: progressPctLabel, backgroundColor: colors.accent.blue, borderRadius: 3 }} />
            </View>
            <View style={{ position: 'absolute', left: 34 - 6, top: 35, zIndex: 1, alignItems: 'center', width: 80, marginLeft: -34 }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, borderWidth: 3, borderColor: '#13A51D', backgroundColor: colors.surface.DEFAULT }} />
              <Text style={{ color: colors.fg.secondary, fontSize: 13, textAlign: 'center', marginTop: 8 }}>
                {boardName}
              </Text>
            </View>
            <View style={{ position: 'absolute', right: 34 - 6, top: 35, zIndex: 1, alignItems: 'center', width: 80, marginRight: -34 }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, borderWidth: 3, borderColor: '#CC4B2B', backgroundColor: colors.surface.DEFAULT }} />
              <Text style={{ color: colors.fg.secondary, fontSize: 13, textAlign: 'center', marginTop: 8 }}>
                {getOffName}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* ScrollView - 전체 차지, 시트가 위로 스크롤되며 헤더 덮음 */}
      <ScrollView
        style={{ flex: 1, zIndex: 10 }}
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT, paddingBottom: FOOTER_HEIGHT + insets.bottom }}
        showsVerticalScrollIndicator={false}
        // bounces={false}
        overScrollMode="never"
      >
        <View
          style={{
            backgroundColor: '#1B1D22',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 16,
            paddingTop: 28,
            paddingBottom: 24,
            minHeight: sheetMinHeight,
            zIndex: 1,
          }}
        >
          <Text style={{ color: colors.fg.DEFAULT, fontSize: 16, fontWeight: '700', marginBottom: 16 }}>
            자리 정보
          </Text>

          <View style={{ backgroundColor: '#262A30', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <View>
              <Text style={{ color: colors.fg.muted, fontSize: 14, fontWeight: '400', letterSpacing: 14 * -0.015, marginBottom: 8 }}>탑승 칸</Text>
              <Text style={{ color: colors.fg.DEFAULT, fontSize: 16, fontWeight: '500' }}>{carLabel}</Text>
            </View>
            <EditButton onPress={() => router.push('/edit-car' as any)} />
          </View>

          <View style={{ backgroundColor: '#262A30', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <View>
              <Text style={{ color: colors.fg.muted, fontSize: 14, fontWeight: '400', letterSpacing: 14 * -0.015, marginBottom: 8 }}>좌석 구역</Text>
              <Text style={{ color: colors.fg.DEFAULT, fontSize: 16, fontWeight: '500' }}>
                {getSeatZoneLabel(state.seatZone)}
              </Text>
            </View>
            <EditButton onPress={() => router.push('/edit-seat' as any)} />
          </View>

          <Text style={{ color: colors.fg.DEFAULT, fontSize: 16, fontWeight: '700', marginBottom: 16 }}>
            인상 착의
          </Text>

          <View style={{ backgroundColor: '#262A30', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <Text style={{ color: colors.fg.DEFAULT, fontSize: 16, flex: 1, marginRight: 8 }} numberOfLines={2}>
              {state.appearance || '미입력'}
            </Text>
            <EditButton onPress={() => router.push('/edit-appearance' as any)} />
          </View>

          <Text style={{ color: colors.fg.DEFAULT, fontSize: 16, fontWeight: '700', marginBottom: 16 }}>
            열차 내 불편 신고
          </Text>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => Linking.openURL('tel:1577-1234')}
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#262A30', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16 }}
            >
              <CallIcon width={20} height={20} />
              <Text style={{ color: colors.fg.DEFAULT, fontSize: 15, fontWeight: '500', lineHeight: 15, letterSpacing: 15 * -0.015 }}>전화로 신고하기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => Linking.openURL('sms:1577-1234')}
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#262A30', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16 }}
            >
              <EmailIcon width={20} height={20} />
              <Text style={{ color: colors.fg.DEFAULT, fontSize: 15, fontWeight: '500', lineHeight: 15, letterSpacing: 15 * -0.015 }}>문자로 신고하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* ✕ 버튼 - 항상 최상위 */}
      <TouchableOpacity
        onPress={() => router.replace('/' as any)}
        style={{ position: 'absolute', top: insets.top + 12, right: 16, width: 40, height: 40, alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
      >
        <Text style={{ color: colors.fg.DEFAULT, fontSize: 24 }}>✕</Text>
      </TouchableOpacity>

      <View style={{ position: 'absolute', top: '60%', left: 0, right: 0, bottom: 0, backgroundColor: '#1B1D22' }}/>

      {/* 푸터 - 항상 하단 고정 */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#1B1D22', paddingHorizontal: 16, paddingBottom: insets.bottom + 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#2E3138', zIndex: 15 }}>
        <TouchableOpacity
          onPress={handleEnd}
          disabled={ending}
          style={{ borderRadius: 12, borderWidth: 1, borderColor: '#0095F8', height: 48, alignItems: 'center', justifyContent: 'center', opacity: ending ? 0.5 : 1 }}
        >
          <Text style={{ color: '#0095F8', fontSize: 16, fontWeight: '400' }}>먼저 내렸어요</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
