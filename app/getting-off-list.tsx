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

export default function GettingOffListScreen() {
  const router = useRouter();
  const { state } = useJourney();
  const [filterCar, setFilterCar] = useState<number[]>(state.carNumbers);

  const station = LINE_2_STATIONS.find(s => s.id === state.stationId);

  const filteredPersons = MOCK_PERSONS
    .filter(p => filterCar.length === 0 || filterCar.includes(p.carNumber))
    .sort((a, b) => a.stopsRemaining - b.stopsRemaining);

  const handleToggleCar = (car: number) => {
    setFilterCar(prev => {
      if (prev.includes(car)) return prev.filter(c => c !== car);
      if (prev.length >= 2) return prev;
      return [...prev, car];
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.DEFAULT }} edges={['top']}>
      <TopBar variant="back" onBack={() => router.back()} />

      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ color: colors.fg.DEFAULT, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
          열람 목록
        </Text>
        {station && (
          <Text style={{ color: colors.accent.link, fontSize: 13, fontWeight: '600' }}>
            {station.name} 방면 · 곧 내릴 사람들
          </Text>
        )}
      </View>

      {/* 탑승칸 필터 */}
      <View style={{ marginBottom: 8 }}>
        <CarTabs selected={filterCar} onToggle={handleToggleCar} />
      </View>

      {/* 정렬 기준 */}
      <View style={{ paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
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

      <BottomButtonArea>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Button label="돌아가기" onPress={() => router.back()} variant="secondary" />
          </View>
          <View style={{ flex: 1 }}>
            <Button label="여정 종료" onPress={() => router.push({ pathname: '/journey-end', params: { role: 'getting-off' } } as any)} variant="primary" />
          </View>
        </View>
      </BottomButtonArea>
    </SafeAreaView>
  );
}
