import React from 'react';
import { View, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { Person } from '../../types/journey';
import { colors } from '../../constants/theme';
import LockIcon from '../../../assets/icons/Lock.svg';

interface PersonCardProps {
  person: Person;
}

export function PersonCard({ person }: PersonCardProps) {
  const badgeLabel =
    person.stopsRemaining === 1
      ? '다음 역 하차'
      : `${person.stopsRemaining}개역 뒤 하차`;
  const badgeColor = person.stopsRemaining === 1 ? '#E53935' : colors.fg.muted;

  return (
    <View
      style={{
        borderRadius: 12,
        backgroundColor: '#262A30',
        borderWidth: 1,
        borderColor: '#454A54',
        overflow: 'hidden',
      }}
    >
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14, flexDirection: 'row' }}>
        <View style={{ alignItems: 'center', marginRight: 12, paddingTop: 2 }}>
          <View style={{ width: 12, height: 12, borderRadius: 6, borderWidth: 3, borderColor: '#13A51D' }} />
          <View style={{ width: 6, flex: 1, backgroundColor: '#434B5B', marginVertical: -6, borderRadius: 3, zIndex: -1 }} />
          <View style={{ width: 12, height: 12, borderRadius: 6, borderWidth: 3, borderColor: '#CC4B2B' }} />
        </View>
        <View style={{ flex: 1, gap: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ color: '#9DA3AF', fontSize: 16, fontWeight: '600', letterSpacing: 16 * -0.015 }}>
                {person.currentStation ?? ''}
              </Text>
              <Text style={{ color: colors.fg.muted, fontSize: 13 }}>
                {person.carNumber}호차
              </Text>
            </View>
            <View
              style={{
                backgroundColor: person.stopsRemaining === 1 ? '#FF191933' : '#202228',
                borderRadius: 99,
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              <Text style={{ color: badgeColor, fontSize: 12, fontWeight: '600' }}>
                {badgeLabel}
              </Text>
            </View>
          </View>
          <Text style={{ color: colors.fg.DEFAULT, fontSize: 18, fontWeight: '600', letterSpacing: 18 * -0.015 }}>
            {person.destinationStation ?? `${person.stopsRemaining}정거장 후`}
          </Text>
        </View>
      </View>

      <View style={{ height: 1, backgroundColor: colors.divider, marginHorizontal: 16 }} />

      <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 20, gap: 10 }}>
        <Text style={{ color: colors.fg.muted, fontSize: 13 }}>인상착의</Text>
        <View style={{ position: 'relative', overflow: 'hidden', borderRadius: 8, minHeight: 44 }}>
          <Text
            style={{ color: colors.fg.DEFAULT, fontSize: 14, lineHeight: 20, paddingVertical: 12, paddingHorizontal: 8 }}
            numberOfLines={2}
          >
            {person.appearance || '인상착의 정보가 등록되지 않았습니다. 인상착의를 등록하면 더 빠르게'}
          </Text>
          <BlurView
            intensity={40}
            tint="dark"
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <LockIcon width={20} height={20} />
            <Text style={{ color: '#0095F8', fontSize: 14, fontWeight: '600', letterSpacing: 14 * -0.015 }}>
              리워드를 사용하여 자세한 정보를 확인하세요.
            </Text>
          </BlurView>
        </View>
      </View>
    </View>
  );
}
