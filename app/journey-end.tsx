import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/constants/theme';
import { TopBar } from '../src/components/ui/TopBar';
import { Button, BottomButtonArea } from '../src/components/ui/Button';
import { useJourney } from '../src/context/JourneyContext';

export default function JourneyEndScreen() {
  const router = useRouter();
  const { reset } = useJourney();

  const handleHome = () => {
    reset();
    router.replace('/');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.DEFAULT }} edges={['top']}>
      <TopBar variant="back" onBack={() => router.back()} />

      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} contentContainerStyle={{ paddingTop: 40 }}>
        {/* 기차 일러스트 */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Text style={{ fontSize: 64 }}>🚇</Text>
        </View>

        <Text
          style={{ color: colors.fg.DEFAULT, fontSize: 18, fontWeight: '600', textAlign: 'center', marginBottom: 32 }}
        >
          여정이 끝났어요.
        </Text>

        {/* 내 이동 정보 */}
        <View style={{ gap: 8, marginBottom: 8 }}>
          <Text style={{ color: colors.fg.DEFAULT, fontSize: 14, fontWeight: '600' }}>
            내 이동 정보
          </Text>
          <View style={{ borderRadius: 12, backgroundColor: colors.surface.card, padding: 16, gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.fg.muted, fontSize: 14 }}>노선</Text>
              <Text style={{ color: colors.fg.DEFAULT, fontSize: 14, fontWeight: '600' }}>2호선</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.fg.muted, fontSize: 14 }}>경로</Text>
              <Text style={{ color: colors.fg.DEFAULT, fontSize: 14, fontWeight: '600' }}>서초 → 잠실새내</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.fg.muted, fontSize: 14 }}>탑승칸</Text>
              <Text style={{ color: colors.fg.DEFAULT, fontSize: 14, fontWeight: '600' }}>5번 칸</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.fg.muted, fontSize: 14 }}>좌석 구역</Text>
              <Text style={{ color: colors.fg.DEFAULT, fontSize: 14, fontWeight: '600' }}>B구역</Text>
            </View>
          </View>
        </View>

        {/* 기여도 내역 */}
        <View style={{ gap: 8, marginTop: 16 }}>
          <Text style={{ color: colors.fg.DEFAULT, fontSize: 14, fontWeight: '600' }}>
            기여도 내역
          </Text>
          <View style={{ borderRadius: 12, backgroundColor: colors.surface.card, padding: 16, gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.fg.muted, fontSize: 14 }}>착석 연결</Text>
              <Text style={{ color: colors.fg.DEFAULT, fontSize: 14, fontWeight: '600' }}>2건</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.fg.muted, fontSize: 14 }}>총 기여 횟수</Text>
              <Text style={{ color: colors.fg.DEFAULT, fontSize: 14, fontWeight: '600' }}>14건</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <BottomButtonArea>
        <Button label="메인으로" onPress={handleHome} />
      </BottomButtonArea>
    </SafeAreaView>
  );
}
