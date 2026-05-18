import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/constants/theme';
import { Button, BottomButtonArea } from '../src/components/ui/Button';
import { useJourney } from '../src/context/JourneyContext';
import { STATION_BY_ID } from '../src/constants/subway';
import TrainIcon from '../assets/icons/Train.svg';

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={{ color: '#EEEEEF', fontSize: 16, fontWeight: '400', letterSpacing: 16 * -0.015 }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>{typeof value === 'string' ? <Text style={{ color: colors.fg.DEFAULT, fontSize: 16, fontWeight: '400', letterSpacing: 16 * -0.015 }}>{value}</Text> : value}</View>
    </View>
  );
}

function LineBadge({ name }: { name: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: colors.line[2], alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.white, fontSize: 11, fontWeight: '700' }}>2</Text>
      </View>
      <Text style={{ color: colors.fg.DEFAULT, fontSize: 16, fontWeight: '400', letterSpacing: 16 * -0.015 }}>{name}</Text>
    </View>
  );
}

export default function JourneyEndScreen() {
  const router = useRouter();
  const { state, reset } = useJourney();
  const params = useLocalSearchParams<{ endedBoard?: string; endedGetOff?: string }>();
  const endedBoard = typeof params.endedBoard === 'string' ? params.endedBoard : '';
  const endedGetOff = typeof params.endedGetOff === 'string' ? params.endedGetOff : '';

  const trainX = useRef(new Animated.Value(-200)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(trainX, { toValue: 0, useNativeDriver: true, tension: 40, friction: 8 }),
      Animated.timing(titleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(300),
      Animated.timing(contentOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const now = new Date();
  const dateStr = `${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const handleHome = () => {
    reset();
    router.replace({
      pathname: '/',
      params: { endedBoard, endedGetOff },
    } as any);
  };

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
          <Text style={{ color: colors.fg.DEFAULT, fontSize: 14, fontWeight: '600', marginBottom: 12 }}>
            내 이동 정보
          </Text>
          <View style={{ borderRadius: 12, backgroundColor: '#262A30', padding: 16, gap: 24, marginBottom: 24 }}>
            <InfoRow label="승차 위치" value={<LineBadge name="서울대입구" />} />
            <InfoRow label="하차 위치" value={<LineBadge name={(state.stationId && STATION_BY_ID[state.stationId]?.name) ?? '선릉'} />} />
            <InfoRow label="하차 시간" value={dateStr} />
          </View>

          <Text style={{ color: colors.fg.DEFAULT, fontSize: 14, fontWeight: '600', marginBottom: 12 }}>
            기여도 내역
          </Text>
          <View style={{ borderRadius: 12, backgroundColor: '#262A30', padding: 16, gap: 24 }}>
            <InfoRow label="추가 기여도" value="+1" />
            <InfoRow label="잔여 기여도" value="+21" />
          </View>
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
