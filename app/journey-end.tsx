import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Animated, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/constants/theme';
import { Button, BottomButtonArea } from '../src/components/ui/Button';
import { useJourney } from '../src/context/JourneyContext';
import { getSeatSharesMeRecentCompleted, getSeatRequestsMeRecentCompleted } from '../src/api/generated';
import TrainIcon from '../assets/icons/Train.svg';

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={{ color: '#EEEEEF', fontSize: 16, fontWeight: '400', letterSpacing: 16 * -0.015 }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>{typeof value === 'string' ? <Text style={{ color: colors.fg.DEFAULT, fontSize: 16, fontWeight: '400', letterSpacing: 16 * -0.015 }}>{value}</Text> : value}</View>
    </View>
  );
}

function LineBadge({ name, lineColor, lineName }: { name: string; lineColor?: string; lineName?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      {lineColor && lineName && (
        <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: lineColor, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.white, fontSize: 11, fontWeight: '700' }}>{lineName.replace(/[^0-9]/g, '')}</Text>
        </View>
      )}
      <Text style={{ color: colors.fg.DEFAULT, fontSize: 16, fontWeight: '400', letterSpacing: 16 * -0.015 }}>{name}</Text>
    </View>
  );
}

type CompletedData = {
  boardStation?: { name?: string; lineName?: string; lineColor?: string };
  getOffStation?: { name?: string; lineName?: string; lineColor?: string };
  completedAt?: string;
  rewardLabel: string;
  rewardValue: number;
  remainingReward: number;
};

function formatDate(iso?: string): string {
  if (!iso) return '-';
  const utc = new Date(iso);
  if (isNaN(utc.getTime())) return '-';
  const kst = new Date(utc.getTime() + 9 * 60 * 60 * 1000);
  return `${String(kst.getUTCMonth() + 1).padStart(2, '0')}.${String(kst.getUTCDate()).padStart(2, '0')} ${String(kst.getUTCHours()).padStart(2, '0')}:${String(kst.getUTCMinutes()).padStart(2, '0')}`;
}

export default function JourneyEndScreen() {
  const router = useRouter();
  const { reset } = useJourney();
  const params = useLocalSearchParams<{ role?: string }>();
  const role = params.role;

  const [data, setData] = useState<CompletedData | null>(null);
  const [loading, setLoading] = useState(true);


  const trainX = useRef(new Animated.Value(-200)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(trainX, { toValue: 0, useNativeDriver: true, tension: 40, friction: 8 }),
      Animated.timing(titleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    const fetch = async () => {
      try {
        if (role === 'want-seat') {
          const res = await getSeatRequestsMeRecentCompleted({ silent: true });

          if (res) {
            setData({
              boardStation: res.boardStation,
              getOffStation: res.getOffStation,
              completedAt: res.completedAt,
              rewardLabel: '사용 기여도',
              rewardValue: res.spentReward ?? 0,
              remainingReward: res.remainingReward ?? 0,
            });
          }
        } else {
          const res = await getSeatSharesMeRecentCompleted({ silent: true });

          if (res) {
            setData({
              boardStation: res.boardStation,
              getOffStation: res.getOffStation,
              completedAt: res.completedAt,
              rewardLabel: '추가 기여도',
              rewardValue: res.earnedReward ?? 0,
              remainingReward: res.remainingReward ?? 0,
            });
          }
        }
      } catch {
        // API 실패 시 data는 null로 유지
      } finally {
        setLoading(false);
        Animated.sequence([
          Animated.delay(100),
          Animated.timing(contentOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]).start();
      }
    };
    fetch();
  }, [role]);

  const handleHome = () => {
    reset();
    router.replace('/');
  };

  const rewardSign = role === 'want-seat' ? '-' : '+';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.DEFAULT }} edges={['top']}>
<ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}>
        <View style={{ alignItems: 'center', paddingTop: 80, paddingBottom: 16 }}>
          <Animated.View style={{ transform: [{ translateX: trainX }] }}>
            <TrainIcon width={128} height={56} />
          </Animated.View>
        </View>

        <Animated.Text style={{ color: colors.fg.DEFAULT, fontSize: 18, fontWeight: '600', textAlign: 'center', marginBottom: 40, opacity: titleOpacity }}>
          여정을 종료합니다
        </Animated.Text>

        <Animated.View style={{ opacity: contentOpacity }}>
          {loading ? (
            <ActivityIndicator color={colors.fg.DEFAULT} />
          ) : data ? (
            <>
              <Text style={{ color: colors.fg.DEFAULT, fontSize: 14, fontWeight: '600', marginBottom: 12 }}>
                내 이동 정보
              </Text>
              <View style={{ borderRadius: 12, backgroundColor: '#262A30', padding: 16, gap: 24, marginBottom: 24 }}>
                <InfoRow
                  label="승차 위치"
                  value={<LineBadge name={data.boardStation?.name ?? '-'} lineColor={data.boardStation?.lineColor} lineName={data.boardStation?.lineName} />}
                />
                <InfoRow
                  label="하차 위치"
                  value={<LineBadge name={data.getOffStation?.name ?? '-'} lineColor={data.getOffStation?.lineColor} lineName={data.getOffStation?.lineName} />}
                />
                <InfoRow label="하차 시간" value={formatDate(data.completedAt)} />
              </View>

              <Text style={{ color: colors.fg.DEFAULT, fontSize: 14, fontWeight: '600', marginBottom: 12 }}>
                기여도 내역
              </Text>
              <View style={{ borderRadius: 12, backgroundColor: '#262A30', padding: 16, gap: 24 }}>
                <InfoRow label={data.rewardLabel} value={`${rewardSign}${data.rewardValue}`} />
                <InfoRow label="잔여 기여도" value={String(data.remainingReward)} />
              </View>
            </>
          ) : (
            <Text style={{ color: colors.fg.muted, fontSize: 14, textAlign: 'center' }}>
              여정 정보를 불러올 수 없습니다
            </Text>
          )}
        </Animated.View>
      </ScrollView>

      <Animated.View style={{ opacity: contentOpacity }}>
        <BottomButtonArea>
          <Button label="메인으로" onPress={handleHome} />
        </BottomButtonArea>
      </Animated.View>
    </SafeAreaView>
  );
}
