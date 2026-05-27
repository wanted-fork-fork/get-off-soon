import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { Person } from '../../types/journey';
import { colors } from '../../constants/theme';
import LockIcon from '../../../assets/icons/Lock.svg';

const SEAT_COLOR = '#424B62';

function SeatRow({ ids, zone }: { ids: string[]; zone: string }) {
  const sc = (id: string) => zone === id ? colors.accent.blue : SEAT_COLOR;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ width: 35, height: 26, backgroundColor: SEAT_COLOR }} />
      <View style={{ width: 10 }} />
      <View style={{ flex: 1, flexDirection: 'row', gap: 4 }}>
        {ids.map((id) => (
          <View key={id} style={{ flex: 1, height: 26, backgroundColor: sc(id) }} />
        ))}
      </View>
      <View style={{ width: 10 }} />
      <View style={{ width: 35, height: 26, backgroundColor: SEAT_COLOR }} />
    </View>
  );
}

function SeatZoneMini({ zone }: { zone: string }) {
  return (
    <View style={{ backgroundColor: '#323949', borderRadius: 8, paddingHorizontal: 10, marginTop: 4 }}>
      <SeatRow ids={['E', 'C', 'A']} zone={zone} />
      <View style={{ height: 18 }} />
      <SeatRow ids={['F', 'D', 'B']} zone={zone} />
    </View>
  );
}

interface PersonCardProps {
  person: Person;
  unlocked?: boolean;
  seatZoneLabel?: string;
  seatZone?: string;
  onPress?: () => void;
}

export function PersonCard({ person, unlocked = false, seatZoneLabel, seatZone, onPress }: PersonCardProps) {
  const badgeLabel =
    person.stopsRemaining === 1
      ? '다음 역 하차'
      : `${person.stopsRemaining}개역 뒤 하차`;
  const badgeColor = person.stopsRemaining === 1 ? '#E53935' : colors.fg.muted;

  return (
    <Pressable
      onPress={onPress}
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

      {unlocked ? (
        <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 20, gap: 14 }}>
          <View style={{ gap: 12 }}>
            <Text style={{ color: colors.fg.muted, fontSize: 13 }}>인상착의</Text>
            <Text style={{ color: colors.fg.DEFAULT, fontSize: 14, lineHeight: 20 }}>
              {person.appearance || '등록된 인상착의가 없습니다.'}
            </Text>
          </View>
          {(seatZoneLabel || seatZone) && (
            <View style={{ gap: 12 }}>
              <Text style={{ color: colors.fg.muted, fontSize: 13 }}>좌석 위치</Text>
              {seatZoneLabel && (
                <Text style={{ color: colors.fg.DEFAULT, fontSize: 14, fontWeight: '600' }}>{seatZoneLabel}</Text>
              )}
              {seatZone && <SeatZoneMini zone={seatZone} />}
            </View>
          )}
        </View>
      ) : (
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
      )}
    </Pressable>
  );
}
