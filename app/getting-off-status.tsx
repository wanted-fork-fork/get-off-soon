import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useJourney } from '../src/context/JourneyContext';
import { colors } from '../src/constants/theme';
import { getSeatZoneLabel, SEAT_POSITION_TO_ZONE } from '../src/constants/seatZone';
import { STATION_BY_ID, LINE_2_STATIONS } from '../src/constants/subway';
import { Button } from '../src/components/ui/Button';
import { getMySeatShare, earlyExitSeatShare } from '../src/api/generated';
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

export default function GettingOffStatusScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, setTrainId, setStation, toggleCar, setSeatZone, setAppearance, setShareId, reset } = useJourney();
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getMySeatShare();
        if (!res) return;
        setShareId(res.id!);
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

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const carLabel = state.carNumbers.length > 0
    ? state.carNumbers.join('·') + '호차'
    : '미선택';

  const stationName = state.stationId ? STATION_BY_ID[state.stationId]?.name : null;

  const handleEnd = async () => {
    if (ending) return;
    if (state.shareId) {
      setEnding(true);
      try {
        await earlyExitSeatShare(state.shareId);
        reset();
        router.replace('/journey-end' as any);
      } catch (err) {
        if (err instanceof ApiError) {
          Alert.alert('처리 실패', err.message);
        }
      } finally {
        setEnding(false);
      }
    } else {
      router.replace('/journey-end' as any);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#262A30' }} edges={['top']}>
      <View style={{ alignItems: 'flex-end', paddingHorizontal: 16, paddingTop: 12 }}>
        <TouchableOpacity onPress={() => router.replace('/' as any)} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.fg.DEFAULT, fontSize: 24 }}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        bounces={false}
        overScrollMode="never"
      >
        <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
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
              style={{ position: 'absolute', top: 8, left: '40%', marginLeft: -73 / 2, zIndex: 2 }}
            />
            <View style={{ position: 'absolute', left: 0, right: 0, top: 38, height: 6, backgroundColor: '#434B5B', borderRadius: 3 }}>
              <View style={{ height: 6, width: '40%', backgroundColor: colors.accent.blue, borderRadius: 3 }} />
            </View>
            <View style={{ position: 'absolute', left: 34 - 6, top: 35, zIndex: 1, alignItems: 'center', width: 80, marginLeft: -34 }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, borderWidth: 3, borderColor: '#13A51D', backgroundColor: colors.surface.DEFAULT }} />
              <Text style={{ color: colors.fg.secondary, fontSize: 13, textAlign: 'center', marginTop: 8 }}>
                {stationName ?? '출발역'}
              </Text>
            </View>
            <View style={{ position: 'absolute', right: 34 - 6, top: 35, zIndex: 1, alignItems: 'center', width: 80, marginRight: -34 }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, borderWidth: 3, borderColor: '#CC4B2B', backgroundColor: colors.surface.DEFAULT }} />
              <Text style={{ color: colors.fg.secondary, fontSize: 13, textAlign: 'center', marginTop: 8 }}>
                {stationName ?? '도착역'}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ backgroundColor: '#1B1D22', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingTop: 28, paddingBottom: 24, marginTop: 8, flex: 1 }}>
          <Text style={{ color: colors.fg.DEFAULT, fontSize: 16, fontWeight: '700', marginBottom: 16 }}>
            자리 정보
          </Text>

          <View style={{ backgroundColor: '#262A30', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <View>
              <Text style={{ color: colors.fg.muted, fontSize: 14, fontWeight: '400', letterSpacing: 14 * -0.015, marginBottom: 8 }}>탑승 칸</Text>
              <Text style={{ color: colors.fg.DEFAULT, fontSize: 16, fontWeight: '500' }}>{carLabel}</Text>
            </View>
            <EditButton />
          </View>

          <View style={{ backgroundColor: '#262A30', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <View>
              <Text style={{ color: colors.fg.muted, fontSize: 14, fontWeight: '400', letterSpacing: 14 * -0.015, marginBottom: 8 }}>좌석 구역</Text>
              <Text style={{ color: colors.fg.DEFAULT, fontSize: 16, fontWeight: '500' }}>
                {getSeatZoneLabel(state.seatZone)}
              </Text>
            </View>
            <EditButton />
          </View>

          <Text style={{ color: colors.fg.DEFAULT, fontSize: 16, fontWeight: '700', marginBottom: 16 }}>
            인상 착의
          </Text>

          <View style={{ backgroundColor: '#262A30', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <Text style={{ color: colors.fg.DEFAULT, fontSize: 16, flex: 1, marginRight: 8 }} numberOfLines={2}>
              {state.appearance || '미입력'}
            </Text>
            <EditButton />
          </View>

          <Text style={{ color: colors.fg.DEFAULT, fontSize: 16, fontWeight: '700', marginBottom: 16 }}>
            열차 내 불편 신고
          </Text>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => Linking.openURL('tel:1577-1234')}
              style={{ flex: 1, backgroundColor: '#262A30', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14 }}
            >
              <Text style={{ color: colors.fg.muted, fontSize: 12, marginBottom: 6 }}>범죄 및 위급상황</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <CallIcon width={16} height={16} />
                <Text style={{ color: colors.fg.DEFAULT, fontSize: 14, fontWeight: '500' }}>1577-1234</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => Linking.openURL('sms:1577-1234')}
              style={{ flex: 1, backgroundColor: '#262A30', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14 }}
            >
              <Text style={{ color: colors.fg.muted, fontSize: 12, marginBottom: 6 }}>기타 민원</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <EmailIcon width={16} height={16} />
                <Text style={{ color: colors.fg.DEFAULT, fontSize: 14, fontWeight: '500' }}>1577-1234</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={{ backgroundColor: '#1B1D22', paddingHorizontal: 16, paddingBottom: insets.bottom + 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#2E3138' }}>
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
