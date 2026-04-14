import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '../../src/components/ui/TopBar';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Button, BottomButtonArea } from '../../src/components/ui/Button';
import { useJourney } from '../../src/context/JourneyContext';
import { SUBWAY_LINES } from '../../src/constants/subway';
import { colors } from '../../src/constants/theme';

export default function SelectLineScreen() {
  const router = useRouter();
  const { state, setLine } = useJourney();
  const [selectedLine, setSelectedLine] = useState<string | null>(state.lineId);

  const totalSteps = state.role === 'getting-off' ? 5 : 3;

  const handleSelect = (lineId: string) => {
    setSelectedLine(lineId);
    setLine(lineId);
  };

  const handleNext = () => {
    if (!selectedLine) return;
    router.push('/(onboarding)/select-station' as any);
  };

  // 2호선 역을 위/아래 두 줄로 단순 표시
  const line2 = SUBWAY_LINES.find(l => l.id === 'line-2')!;
  const half = Math.ceil(line2.stations.length / 2);
  const topRow = line2.stations.slice(0, half);
  const bottomRow = line2.stations.slice(half);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.DEFAULT }} edges={['top']}>
      <TopBar variant="back" onBack={() => router.back()} />
      <ProgressBar current={1} total={totalSteps} />

      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 32 }}>
        <Text style={{ color: colors.fg.DEFAULT, fontSize: 18, fontWeight: '600', marginBottom: 24 }}>
          현재 타고 있는 열차를{'\n'}선택해주세요.
        </Text>

        {/* 노선 선택 칩 */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 32 }}>
          {SUBWAY_LINES.map(line => (
            <TouchableOpacity
              key={line.id}
              onPress={() => handleSelect(line.id)}
              style={{
                backgroundColor: selectedLine === line.id ? colors.accent.tab : colors.progress.track,
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 10,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: line.color }} />
              <Text
                style={{ color: selectedLine === line.id ? colors.white : colors.fg.inactive, fontSize: 16, fontWeight: '600' }}
              >
                {line.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 단순화된 노선도 */}
        <View style={{ borderRadius: 12, backgroundColor: colors.surface.card, padding: 16, gap: 16 }}>
          <Text style={{ color: colors.fg.muted, fontSize: 12, marginBottom: 8 }}>
            현재는 2호선만 지원합니다
          </Text>
          {/* 위 행 */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 0 }}>
              {topRow.map((station, i) => (
                <View key={station.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ alignItems: 'center', width: 48 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, marginBottom: 4, backgroundColor: colors.line[2] }} />
                    <Text style={{ color: colors.white, fontSize: 10, textAlign: 'center' }}>
                      {station.name}
                    </Text>
                  </View>
                  {i < topRow.length - 1 && (
                    <View style={{ width: 16, height: 2, marginBottom: 12, backgroundColor: colors.line[2] }} />
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
          {/* 아래 행 */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 0 }}>
              {bottomRow.map((station, i) => (
                <View key={station.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ alignItems: 'center', width: 48 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, marginBottom: 4, backgroundColor: colors.line[2] }} />
                    <Text style={{ color: colors.white, fontSize: 10, textAlign: 'center' }}>
                      {station.name}
                    </Text>
                  </View>
                  {i < bottomRow.length - 1 && (
                    <View style={{ width: 16, height: 2, marginBottom: 12, backgroundColor: colors.line[2] }} />
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>

      <BottomButtonArea>
        <Button
          label="다음"
          onPress={handleNext}
          disabled={!selectedLine}
        />
      </BottomButtonArea>
    </SafeAreaView>
  );
}
