import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Linking, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useJourney } from '../src/context/JourneyContext';
import { colors } from '../src/constants/theme';
import { getSeatZoneLabel, SEAT_POSITION_TO_ZONE } from '../src/constants/seatZone';
import { STATION_BY_ID, STATION_BY_NAME, LINE_2_STATIONS, LINE_2_ID } from '../src/constants/subway';
import { Button } from '../src/components/ui/Button';
import { BottomSheet } from '../src/components/ui/BottomSheet';
import { getMySeatShare, earlyExitSeatShare, getTrainsByLine, getSeatSharesMeStatus } from '../src/api/generated';
import { ApiError } from '../src/api/client';
import CallIcon from '../assets/icons/Call.svg';
import EmailIcon from '../assets/icons/Email.svg';

const REPORT_TYPES = [
  '너무 추워요', '너무 더워요',
  '물품판매', '소란행위',
  '형사범', '성추행',
  '불법촬영', '기타신고',
] as const;

const REPORT_TEMPLATES: Record<string, string> = {
  '너무 추워요': '객실 온도가 너무 낮아 춥습니다. 온도 조정을 요청합니다.',
  '너무 더워요': '객실 온도가 너무 높아 덥습니다. 온도 조정을 요청합니다.',
  '물품판매': '열차 내 무허가 물품판매가 진행 중입니다.',
  '소란행위': '열차 내 소란행위가 발생하고 있습니다.',
  '형사범': '열차 내 형사범죄가 의심되는 상황입니다.',
  '성추행': '열차 내 성추행이 발생했습니다. 즉시 조치 바랍니다.',
  '불법촬영': '열차 내 불법촬영이 의심됩니다. 즉시 조치 바랍니다.',
  '기타신고': '',
};
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
  // 하차역까지 남은 정류장 수 (status 폴링의 progress.remainingStops). null = 위치 미상
  const [remainingStops, setRemainingStops] = useState<number | null>(null);
  const [trainNo, setTrainNo] = useState<string | null>(null);
  const [reportSheetOpen, setReportSheetOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);


  useEffect(() => {
    (async () => {
      try {
        const res = await getMySeatShare();
        console.log('[getting-off-status] getMySeatShare:', JSON.stringify(res, null, 2));
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

  // 신고 문자에 넣을 열차 번호는 1회만 조회한다. (실시간 위치/도착은 status 폴링이 담당)
  useEffect(() => {
    if (!state.trainId || trainNo) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await getTrainsByLine(LINE_2_ID);
        if (cancelled) return;
        const train = res.trains?.find((t) => t.id === state.trainId);
        if (train?.trainNo) setTrainNo(train.trainNo);
      } catch (err) {
        if (err instanceof ApiError) return;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [state.trainId, trainNo]);

  const boardStation = boardStationName ? STATION_BY_NAME[boardStationName] : null;
  const getOffStation = state.stationId ? STATION_BY_ID[state.stationId] : null;

  // 진행률 바: 서버의 remainingStops 기준. 전체 정거장 수는 로컬 노선 상수로 근사한다.
  let progressPct = 0;
  let stationsRemaining = remainingStops ?? 0;
  if (remainingStops != null && boardStation && getOffStation) {
    const total = Math.abs(getOffStation.order - boardStation.order);
    if (total > 0) {
      progressPct = Math.max(0, Math.min(1, 1 - remainingStops / total));
    }
    stationsRemaining = Math.max(0, remainingStops);
  }

  // 도착 시간은 서버가 주지 않으므로 임의 추정하지 않고, 남은 정류장 수만 노출한다.
  const stopsLabel = remainingStops != null
    ? `${stationsRemaining} 정류장 전`
    : '위치 확인 중';

  const sortedCarriages = [...state.carNumbers].sort((a, b) => a - b);
  const carLabel = sortedCarriages.length > 0
    ? sortedCarriages.join('·') + '호차'
    : '미선택';

  const boardName = boardStation?.name ?? '출발역';
  const getOffName = getOffStation?.name ?? '도착역';
  const progressPctLabel: `${number}%` = `${Math.round(progressPct * 100)}%`;

  // 통합 상태 폴링 - 실시간 위치(남은 정류장) 갱신 + 도착 완료 시 journey-end로 이동
  useEffect(() => {
    if (!state.shareId) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await getSeatSharesMeStatus();
        console.log('[getting-off-status] poll status:', JSON.stringify(res, null, 2));
        if (cancelled) return;
        if (res.phase === 'active' && res.progress) {
          setRemainingStops(res.progress.remainingStops ?? null);
          if (res.share?.boardStationName) setBoardStationName(res.share.boardStationName);
        } else if (res.phase === 'completed' || res.phase === 'none') {
          // completed result는 1회 소비형 — journey-end는 recent-completed(비소비형)로 다시 조회한다.
          reset();
          router.replace({
            pathname: '/journey-end',
            params: { role: 'getting-off' },
          } as any);
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
  }, [state.shareId]);

  const handleEnd = async () => {
    if (ending) return;
    const endParams = { role: 'getting-off' };
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
            {stopsLabel}
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
              onPress={() => { setSelectedReport(null); setReportSheetOpen(true); }}
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

      <BottomSheet open={reportSheetOpen} onClose={() => setReportSheetOpen(false)} showHandle={false}>
        <Text style={{ color: colors.fg.DEFAULT, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
          열차에서 불편함을 느끼셨나요?
        </Text>
        <Text style={{ color: colors.fg.secondary, fontSize: 14, fontWeight: '400', marginBottom: 20 }}>
          유형을 선택하면 신고 문자를 완성해드려요.
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {REPORT_TYPES.map((type) => {
            const selected = selectedReport === type;
            return (
              <TouchableOpacity
                key={type}
                activeOpacity={0.8}
                onPress={() => setSelectedReport(selected ? null : type)}
                style={{
                  flexBasis: '45%',
                  flexGrow: 1,
                  height: 56,
                  borderRadius: 12,
                  paddingVertical: 16,
                  paddingHorizontal: 12,
                  gap: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#2D3239',
                }}
              >
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: selected ? colors.accent.blue : '#484B51',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {selected && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent.blue }} />}
                </View>
                <Text style={{ color: colors.fg.DEFAULT, fontSize: 15, fontWeight: '400' }}>{type}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Button label="돌아가기" variant="outline" onPress={() => setReportSheetOpen(false)} />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              label="문자로 신고하기"
              onPress={() => {
                setReportSheetOpen(false);
                const lineName = '2호선';
                const carInfo = state.carNumbers.length > 0
                  ? state.carNumbers.sort((a, b) => a - b).join(', ') + '호차'
                  : '';
                const trainInfo = trainNo ? `${trainNo}열차` : '';
                const location = [lineName, trainInfo, carInfo].filter(Boolean).join(' ');
                const template = REPORT_TEMPLATES[selectedReport!] ?? '';
                const body = `[${selectedReport}] ${location}\n${template}`;
                Linking.openURL(`sms:1577-1234&body=${encodeURIComponent(body)}`);
              }}
              disabled={!selectedReport}
            />
          </View>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}
