import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/constants/theme';
import { TopBar } from '../src/components/ui/TopBar';
import { CarTabs } from '../src/components/ui/CarTabs';
import { PersonCard } from '../src/components/ui/PersonCard';
import { Button, BottomButtonArea } from '../src/components/ui/Button';
import { useJourney } from '../src/context/JourneyContext';
import { MOCK_PERSONS } from '../src/constants/mock';
import { LINE_2_STATIONS } from '../src/constants/subway';

export default function SeatSeekersScreen() {
  const router = useRouter();
  const { state } = useJourney();
  const [filterCar, setFilterCar] = useState<number | null>(state.carNumbers[0] ?? null);

  const station = LINE_2_STATIONS.find(s => s.id === state.stationId);

  const filteredPersons = MOCK_PERSONS
    .filter(p => filterCar == null || p.carNumber === filterCar)
    .sort((a, b) => a.stopsRemaining - b.stopsRemaining);

  const handleEnd = () => {
    router.push('/journey-end' as any);
  };

  const handleToggleCar = (car: number) => {
    setFilterCar(car);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.DEFAULT }} edges={['top']}>
      <TopBar variant="back" onBack={() => router.back()} title="하차 예정자" />

      {/* 탑승칸 필터 */}
      <View style={{ marginBottom: 40 }}>
        <Text style={{ color: colors.fg.muted, fontSize: 12, textAlign: 'right', paddingHorizontal: 16, marginBottom: 16 }}>
          열차 진행 방향 →
        </Text>
        <CarTabs selected={filterCar != null ? [filterCar] : []} onToggle={handleToggleCar} />
      </View>

      {/* 정렬 기준 */}
      <View style={{ paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginBottom: 8 }}>
        <Text style={{ color: colors.fg.muted, fontSize: 13 }}>
          하차 가까운 순
        </Text>
        <Text style={{ color: colors.fg.muted, fontSize: 10 }}>▼</Text>
      </View>

      {/* 카드 목록 */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} contentContainerStyle={{ gap: 12, paddingBottom: 16 }}>
        {filteredPersons.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 64 }}>
            <Text style={{ color: colors.fg.muted, fontSize: 16 }}>
              해당 칸에 하차 예정자가 없어요
            </Text>
          </View>
        ) : (
          filteredPersons.map(person => (
            <PersonCard key={person.id} person={person} />
          ))
        )}
      </ScrollView>

      <View style={{ backgroundColor: '#1B1D22', borderTopWidth: 1, borderTopColor: '#454A54', paddingHorizontal: 16, paddingBottom: 32, paddingTop: 12 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 2 }}>
            <Button label="먼저 내렸어요" onPress={handleEnd} variant="outline" />
          </View>
          <View style={{ flex: 3 }}>
            <Button label="앉았어요" onPress={handleEnd} variant="primary" />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
