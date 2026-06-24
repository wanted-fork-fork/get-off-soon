import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/constants/theme';
import { TopBar } from '../src/components/ui/TopBar';
import { PersonCard } from '../src/components/ui/PersonCard';
import { getViewedShares } from '../src/api/generated';
import type { GetViewedSharesResponse } from '../src/api/generated';
import { SEAT_POSITION_TO_ZONE, getSeatZoneLabel } from '../src/constants/seatZone';
import { ApiError } from '../src/api/client';

type ViewedShare = NonNullable<GetViewedSharesResponse['upcoming']>[number];

export default function GettingOffListScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [data, setData] = useState<GetViewedSharesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getViewedShares({ silent: true });
        setData(res);
      } catch (err) {
        if (err instanceof ApiError) return;
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const list = tab === 'upcoming' ? (data?.upcoming ?? []) : (data?.completed ?? []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.DEFAULT }} edges={['top']}>
      <TopBar variant="back" onBack={() => router.back()} title="열람 목록" />

      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginTop: 8, marginBottom: 16 }}>
        <Pressable
          onPress={() => setTab('upcoming')}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: tab === 'upcoming' ? colors.accent.blue : '#262A30',
          }}
        >
          <Text style={{ color: colors.fg.DEFAULT, fontSize: 14, fontWeight: '600' }}>하차 예정</Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('completed')}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: tab === 'completed' ? colors.accent.blue : '#262A30',
          }}
        >
          <Text style={{ color: colors.fg.DEFAULT, fontSize: 14, fontWeight: '600' }}>하차 완료</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.fg.DEFAULT} />
        </View>
      ) : (
        <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} contentContainerStyle={{ gap: 12, paddingBottom: 32 }}>
          {list.length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 64 }}>
              <Text style={{ color: colors.fg.muted, fontSize: 16 }}>
                {tab === 'upcoming' ? '하차 예정 열람 내역이 없어요' : '하차 완료 내역이 없어요'}
              </Text>
            </View>
          ) : (
            list.map((share, i) => {
              const zone = typeof share.seatPosition === 'number'
                ? SEAT_POSITION_TO_ZONE[share.seatPosition]
                : undefined;
              return (
                <PersonCard
                  key={share.shareId ?? i}
                  person={{
                    id: share.shareId ?? String(i),
                    stopsRemaining: share.stopsAway ?? 0,
                    carNumber: share.carriages?.[0] ?? 0,
                    seatZone: zone ?? '',
                    currentStation: share.boardStationName,
                    destinationStation: share.getOffStationName,
                    appearance: share.appearance,
                  }}
                  unlocked
                  seatZoneLabel={zone ? getSeatZoneLabel(zone) : undefined}
                  seatZone={zone}
                />
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
