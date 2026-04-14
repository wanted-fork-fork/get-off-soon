import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '../../src/components/ui/TopBar';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Button, BottomButtonArea } from '../../src/components/ui/Button';
import { useJourney } from '../../src/context/JourneyContext';
import { LINE_2_STATIONS } from '../../src/constants/subway';
import { colors } from '../../src/constants/theme';

export default function SelectStationScreen() {
  const router = useRouter();
  const { state, setStation } = useJourney();
  const [selected, setSelected] = useState<string | null>(state.stationId);

  const totalSteps = state.role === 'getting-off' ? 5 : 3;

  const handleSelect = (id: string) => {
    setSelected(id);
    setStation(id);
  };

  const handleNext = () => {
    if (!selected) return;
    router.push('/(onboarding)/select-car' as any);
  };

  const selectedStation = LINE_2_STATIONS.find(s => s.id === selected);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.DEFAULT }} edges={['top']}>
      <TopBar variant="back" onBack={() => router.back()} />
      <ProgressBar current={2} total={totalSteps} />

      <View style={{ paddingHorizontal: 16, paddingTop: 32, paddingBottom: 8 }}>
        <Text style={{ color: colors.fg.DEFAULT, fontSize: 18, fontWeight: '600', marginBottom: 4 }}>
          하차 예정인 역을{'\n'}선택해주세요.
        </Text>
        {selectedStation && (
          <Text style={{ color: colors.accent.link, fontSize: 14, fontWeight: '600', marginTop: 8 }}>
            선택: {selectedStation.name}
          </Text>
        )}
      </View>

      <FlatList
        data={LINE_2_STATIONS}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, gap: 8, paddingBottom: 16 }}
        renderItem={({ item }) => {
          const isSelected = selected === item.id;
          return (
            <TouchableOpacity
              onPress={() => handleSelect(item.id)}
              style={{
                backgroundColor: isSelected ? colors.accent.tab : colors.surface.card,
                borderRadius: 10,
                paddingHorizontal: 16,
                paddingVertical: 14,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.line[2] }} />
              <Text
                style={{ color: isSelected ? colors.white : colors.fg.DEFAULT, fontSize: 16, fontWeight: '600' }}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <BottomButtonArea>
        <Button label="다음" onPress={handleNext} disabled={!selected} />
      </BottomButtonArea>
    </SafeAreaView>
  );
}
