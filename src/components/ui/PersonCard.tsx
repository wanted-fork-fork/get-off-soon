import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Person } from '../../types/journey';
import { colors } from '../../constants/theme';

interface PersonCardProps {
  person: Person;
}

export function PersonCard({ person }: PersonCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      onPress={() => setExpanded(e => !e)}
      style={{ borderRadius: 12, backgroundColor: colors.surface.card, paddingHorizontal: 16, paddingVertical: 16, gap: 12 }}
    >
      {/* 상단 행: 남은 정거장 + 탑승칸 */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View
            style={{ borderRadius: 6, backgroundColor: colors.accent.tab, paddingHorizontal: 8, paddingVertical: 4 }}
          >
            <Text style={{ color: colors.white, fontSize: 12, fontWeight: '600' }}>
              {person.stopsRemaining}정거장 후 하차
            </Text>
          </View>
        </View>
        <Text style={{ color: colors.fg.muted, fontSize: 13 }}>
          {person.carNumber}번 칸
        </Text>
      </View>

      {/* 구분선 */}
      <View style={{ backgroundColor: colors.divider, height: 1 }} />

      {/* 좌석 구역 */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={{ color: colors.fg.muted, fontSize: 13 }}>좌석 구역</Text>
        <Text style={{ color: colors.fg.DEFAULT, fontSize: 14, fontWeight: '600' }}>
          {person.seatZone}구역
        </Text>
      </View>

      {/* 인상착의 (있을 때만) */}
      {person.appearance && (
        <>
          <View style={{ backgroundColor: colors.divider, height: 1 }} />
          <View>
            <Text style={{ color: colors.fg.muted, fontSize: 13, marginBottom: 4 }}>인상착의</Text>
            <Text
              style={{ color: colors.fg.DEFAULT, fontSize: 14 }}
              numberOfLines={expanded ? undefined : 1}
            >
              {person.appearance}
            </Text>
          </View>
        </>
      )}

      {/* 더보기/접기 */}
      {person.appearance && person.appearance.length > 20 && (
        <Text style={{ color: colors.accent.link, fontSize: 13 }}>
          {expanded ? '접기 ↑' : '더보기 ↓'}
        </Text>
      )}
    </TouchableOpacity>
  );
}
