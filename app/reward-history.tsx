import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Line, Rect } from 'react-native-svg';
import { colors } from '../src/constants/theme';
import { TopBar } from '../src/components/ui/TopBar';
import { getRewards, GetRewardsResponse } from '../src/api/generated';
import { ApiError } from '../src/api/client';

type RewardHistoryItem = NonNullable<GetRewardsResponse['history']>[number];

function formatDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

function extractLineNumber(lineName?: string): string {
  if (!lineName) return '';
  const match = lineName.match(/(\d+)/);
  return match ? match[1] : lineName.charAt(0);
}

function LineBadge({ lineName, lineColor, stationName }: { lineName?: string; lineColor?: string; stationName?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <View
        style={{
          width: 16,
          height: 16,
          borderRadius: 8,
          backgroundColor: lineColor ?? colors.line[2],
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: colors.white, fontSize: 10, fontWeight: '700' }}>{extractLineNumber(lineName)}</Text>
      </View>
      <Text style={{ color: colors.fg.secondary, fontSize: 13 }}>{stationName}</Text>
    </View>
  );
}

function RewardRow({ item }: { item: RewardHistoryItem }) {
  const amount = item.amount ?? 0;
  const isPositive = amount > 0;
  const share = item.share ?? undefined;
  return (
    <View style={{ paddingVertical: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={{ color: colors.fg.DEFAULT, fontSize: 15, fontWeight: '500' }}>{item.label ?? item.type ?? ''}</Text>
          {share && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <LineBadge
                lineName={share.boardLineName}
                lineColor={share.boardLineColor}
                stationName={share.boardStationName}
              />
              <Text style={{ color: colors.fg.muted, fontSize: 12 }}>→</Text>
              <LineBadge
                lineName={share.getOffLineName}
                lineColor={share.getOffLineColor}
                stationName={share.getOffStationName}
              />
            </View>
          )}
        </View>
        <Text
          style={{
            color: isPositive ? colors.fg.DEFAULT : colors.fg.secondary,
            fontSize: 15,
            fontWeight: '500',
            marginLeft: 12,
          }}
        >
          {isPositive ? `+${amount}` : `${amount}`}
        </Text>
      </View>
    </View>
  );
}

function EmptyIllustration() {
  return (
    <Svg width={120} height={120} viewBox="0 0 120 120">
      <Rect x={1} y={1} width={118} height={118} stroke={colors.fg.disabled} strokeWidth={1} fill="none" />
      <Line x1={1} y1={1} x2={119} y2={119} stroke={colors.fg.disabled} strokeWidth={1} />
      <Line x1={119} y1={1} x2={1} y2={119} stroke={colors.fg.disabled} strokeWidth={1} />
    </Svg>
  );
}

export default function RewardHistoryScreen() {
  const router = useRouter();
  const [rewardPoints, setRewardPoints] = useState(0);
  const [items, setItems] = useState<RewardHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await getRewards();
        if (!active) return;
        setRewardPoints(res.rewardPoints ?? 0);
        setItems(res.history ?? []);
      } catch (err) {
        if (!active) return;
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('리워드 내역을 불러오지 못했습니다.');
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, RewardHistoryItem[]>();
    items.forEach(item => {
      const date = formatDate(item.createdAt);
      const arr = map.get(date) ?? [];
      arr.push(item);
      map.set(date, arr);
    });
    return Array.from(map.entries());
  }, [items]);

  const isEmpty = !loading && items.length === 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.DEFAULT }} edges={['top']}>
      <TopBar variant="back" onBack={() => router.back()} title="리워드 내역" />

      {/* 보유 리워드 헤더 */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}>
        <Text style={{ color: colors.fg.secondary, fontSize: 14, marginBottom: 8 }}>현재 보유 리워드</Text>
        <Text style={{ color: colors.fg.DEFAULT, fontSize: 32, fontWeight: '700', letterSpacing: -0.5 }}>
          {rewardPoints}
        </Text>
      </View>

      <View style={{ height: 1, backgroundColor: colors.divider }} />

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.fg.muted} />
        </View>
      ) : error ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <Text style={{ color: colors.fg.muted, fontSize: 14, textAlign: 'center' }}>{error}</Text>
        </View>
      ) : isEmpty ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 }}>
          <EmptyIllustration />
          <Text style={{ color: colors.fg.muted, fontSize: 14 }}>리워드 적립 및 사용 내역이 없습니다.</Text>
        </View>
      ) : (
        <>
          {/* 정렬 */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 16,
              paddingBottom: 8,
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ color: colors.fg.secondary, fontSize: 13 }}>최신순</Text>
              <Text style={{ color: colors.fg.secondary, fontSize: 10 }}>▼</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
          >
            {grouped.map(([date, rows]) => (
              <View key={date} style={{ marginTop: 16 }}>
                <Text style={{ color: colors.fg.muted, fontSize: 13, marginBottom: 4 }}>{date}</Text>
                {rows.map(item => (
                  <RewardRow key={item.id} item={item} />
                ))}
              </View>
            ))}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}
