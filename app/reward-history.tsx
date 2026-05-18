import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Line, Rect } from 'react-native-svg';
import { colors } from '../src/constants/theme';
import { TopBar } from '../src/components/ui/TopBar';

type RewardRoute = {
  from: { line: number; name: string };
  to: { line: number; name: string };
};

type RewardItem = {
  id: string;
  date: string;
  title: string;
  amount: number;
  route?: RewardRoute;
};

const CURRENT_BALANCE = 30;

const DUMMY_ITEMS: RewardItem[] = [
  { id: '1', date: '2026.04.20', title: '광고 시청', amount: 1 },
  {
    id: '2',
    date: '2026.04.20',
    title: '정보 열람',
    amount: -1,
    route: { from: { line: 2, name: '사당' }, to: { line: 2, name: '홍대입구' } },
  },
  {
    id: '3',
    date: '2026.04.20',
    title: '정보 열람',
    amount: -1,
    route: { from: { line: 2, name: '사당' }, to: { line: 2, name: '홍대입구' } },
  },
  {
    id: '4',
    date: '2026.04.20',
    title: '정보 열람',
    amount: -1,
    route: { from: { line: 2, name: '사당' }, to: { line: 2, name: '홍대입구' } },
  },
  { id: '5', date: '2026.04.19', title: '광고 시청', amount: 1 },
  { id: '6', date: '2026.04.10', title: '좌석 정보 열람', amount: -1 },
  { id: '7', date: '2026.04.01', title: '자리 정보 등록', amount: 1 },
];

const LINE_COLORS: Record<number, string> = {
  1: '#0052A4',
  2: '#00A44A',
  3: '#EF7C1C',
  4: '#00A4E3',
  5: '#996CAC',
  6: '#CD7C2F',
  7: '#747F00',
  8: '#E6186C',
  9: '#BDB092',
};

function LineBadge({ line, name }: { line: number; name: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <View
        style={{
          width: 16,
          height: 16,
          borderRadius: 8,
          backgroundColor: LINE_COLORS[line] ?? colors.line[2],
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: colors.white, fontSize: 10, fontWeight: '700' }}>{line}</Text>
      </View>
      <Text style={{ color: colors.fg.secondary, fontSize: 13 }}>{name}</Text>
    </View>
  );
}

function RewardRow({ item }: { item: RewardItem }) {
  const isPositive = item.amount > 0;
  return (
    <View style={{ paddingVertical: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={{ color: colors.fg.DEFAULT, fontSize: 15, fontWeight: '500' }}>{item.title}</Text>
          {item.route && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <LineBadge line={item.route.from.line} name={item.route.from.name} />
              <Text style={{ color: colors.fg.muted, fontSize: 12 }}>→</Text>
              <LineBadge line={item.route.to.line} name={item.route.to.name} />
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
          {isPositive ? `+${item.amount}` : `${item.amount}`}
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
  const items = DUMMY_ITEMS;

  const grouped = useMemo(() => {
    const map = new Map<string, RewardItem[]>();
    items.forEach(item => {
      const arr = map.get(item.date) ?? [];
      arr.push(item);
      map.set(item.date, arr);
    });
    return Array.from(map.entries());
  }, [items]);

  const isEmpty = items.length === 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.DEFAULT }} edges={['top']}>
      <TopBar variant="back" onBack={() => router.back()} title="리워드 내역" />

      {/* 보유 리워드 헤더 */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}>
        <Text style={{ color: colors.fg.secondary, fontSize: 14, marginBottom: 8 }}>현재 보유 리워드</Text>
        <Text style={{ color: colors.fg.DEFAULT, fontSize: 32, fontWeight: '700', letterSpacing: -0.5 }}>
          {isEmpty ? 0 : CURRENT_BALANCE}
        </Text>
      </View>

      <View style={{ height: 1, backgroundColor: colors.divider }} />

      {isEmpty ? (
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
