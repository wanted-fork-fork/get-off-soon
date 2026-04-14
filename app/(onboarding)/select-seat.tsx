import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '../../src/components/ui/TopBar';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Button, BottomButtonArea } from '../../src/components/ui/Button';
import { useJourney } from '../../src/context/JourneyContext';
import { colors } from '../../src/constants/theme';

const SEAT_ZONES = [
  { id: 'A', label: 'A구역', desc: '문 쪽 좌석 (좌상)' },
  { id: 'B', label: 'B구역', desc: '문 쪽 좌석 (우상)' },
  { id: 'C', label: 'C구역', desc: '중간 좌석 (좌)' },
  { id: 'D', label: 'D구역', desc: '중간 좌석 (우)' },
  { id: 'E', label: 'E구역', desc: '문 쪽 좌석 (좌하)' },
  { id: 'F', label: 'F구역', desc: '문 쪽 좌석 (우하)' },
];

function SeatButton({ id, selected, onPress }: { id: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: selected ? colors.accent.tab : colors.progress.track,
        flex: 1,
        borderRadius: 8,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: selected ? colors.white : colors.fg.inactive, fontSize: 16, fontWeight: '600' }}>
        {id}
      </Text>
    </TouchableOpacity>
  );
}

export default function SelectSeatScreen() {
  const router = useRouter();
  const { state, setSeatZone } = useJourney();

  const handleNext = () => {
    if (!state.seatZone) return;
    router.push('/(onboarding)/appearance' as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.DEFAULT }} edges={['top']}>
      <TopBar variant="back" onBack={() => router.back()} />
      <ProgressBar current={4} total={5} />

      <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 32 }} contentContainerStyle={{ paddingBottom: 16 }}>
        <Text style={{ color: colors.fg.DEFAULT, fontSize: 18, fontWeight: '600', marginBottom: 32 }}>
          앉아있는 좌석의 구역을{'\n'}선택해주세요.
        </Text>

        {/* 열차 단면도 */}
        <View style={{ borderRadius: 12, backgroundColor: colors.surface.card, padding: 16, marginBottom: 24 }}>
          <Text style={{ color: colors.fg.muted, fontSize: 11, marginBottom: 12, textAlign: 'center' }}>
            — 출입문 — 출입문 —
          </Text>
          <View style={{ gap: 8 }}>
            {[['A', 'B'], ['C', 'D'], ['E', 'F']].map(row => (
              <View key={row.join()} style={{ flexDirection: 'row', gap: 8 }}>
                {row.map(id => (
                  <SeatButton key={id} id={id} selected={state.seatZone === id} onPress={() => setSeatZone(id)} />
                ))}
              </View>
            ))}
          </View>
          <Text style={{ color: colors.fg.muted, fontSize: 11, marginTop: 12, textAlign: 'center' }}>
            — 출입문 — 출입문 —
          </Text>
        </View>

        {/* 구역 설명 리스트 */}
        <View style={{ gap: 8 }}>
          {SEAT_ZONES.map(zone => {
            const selected = state.seatZone === zone.id;
            return (
              <TouchableOpacity
                key={zone.id}
                onPress={() => setSeatZone(zone.id)}
                style={{
                  backgroundColor: selected ? colors.accent.tab : colors.surface.card,
                  borderRadius: 10,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <Text style={{ width: 48, color: selected ? colors.white : colors.fg.DEFAULT, fontSize: 16, fontWeight: '600' }}>
                  {zone.label}
                </Text>
                <Text style={{ color: selected ? 'rgba(255,255,255,0.7)' : colors.fg.muted, fontSize: 14 }}>
                  {zone.desc}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <BottomButtonArea>
        <Button label="다음" onPress={handleNext} disabled={!state.seatZone} />
      </BottomButtonArea>
    </SafeAreaView>
  );
}
