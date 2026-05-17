import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/constants/theme';
import { useJourney } from '../src/context/JourneyContext';
import { TopBar } from '../src/components/ui/TopBar';
import { RoleCard } from '../src/components/ui/RoleCard';
import { getMySeatShare, getMySeatRequest } from '../src/api/generated';
import type { GetMySeatShareResponse, GetMySeatRequestResponse } from '../src/api/generated';
import { ApiError } from '../src/api/client';
import { LINE_2_ID, LINE_2_STATIONS } from '../src/constants/subway';
import { SEAT_POSITION_TO_ZONE } from '../src/constants/seatZone';

type ActiveShare = NonNullable<GetMySeatShareResponse>;
type ActiveRequest = GetMySeatRequestResponse;

export default function HomeScreen() {
  const router = useRouter();
  const {
    state,
    setRole,
    setLine,
    setTrainId,
    setStation,
    toggleCar,
    setSeatZone,
    setAppearance,
    setShareId,
    setRequestId,
  } = useJourney();

  const [activeShare, setActiveShare] = useState<ActiveShare | null>(null);
  const [activeRequest, setActiveRequest] = useState<ActiveRequest | null>(null);
  const [loadingActive, setLoadingActive] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [shareRes, requestRes] = await Promise.all([
          getMySeatShare(),
          getMySeatRequest(),
        ]);

        if (shareRes) {
          setActiveShare(shareRes);
          setRole('getting-off');
          setLine(LINE_2_ID);
          if (shareRes.id) setShareId(shareRes.id);
          if (shareRes.trainId) setTrainId(shareRes.trainId);
          const found = LINE_2_STATIONS.find((s) => s.name === shareRes.getOffStationName);
          if (found) setStation(found.id);
          if (state.carNumbers.length === 0 && shareRes.carriages) {
            shareRes.carriages.forEach((n) => toggleCar(n));
          }
          if (typeof shareRes.seatPosition === 'number') {
            const zone = SEAT_POSITION_TO_ZONE[shareRes.seatPosition];
            if (zone) setSeatZone(zone);
          }
          if (shareRes.appearance) setAppearance(shareRes.appearance);
        } else if (requestRes && requestRes.id) {
          setActiveRequest(requestRes);
          setRole('want-seat');
          setLine(LINE_2_ID);
          if (requestRes.id) setRequestId(requestRes.id);
          if (requestRes.trainId) setTrainId(requestRes.trainId);
          const found = LINE_2_STATIONS.find((s) => s.name === requestRes.getOffStationName);
          if (found) setStation(found.id);
          if (state.carNumbers.length === 0 && requestRes.carriages) {
            requestRes.carriages.forEach((n) => toggleCar(n));
          }
        }
      } catch (e) {
        if (e instanceof ApiError) {
          return;
        }
        throw e;
      } finally {
        setLoadingActive(false);
      }
    })();
  }, []);

  const handleGettingOff = () => {
    setRole('getting-off');
    router.push('/(onboarding)/select-line' as any);
  };

  const handleWantSeat = () => {
    setRole('want-seat');
    router.push('/(onboarding)/select-line' as any);
  };

  const pillBaseStyle = {
    position: 'absolute' as const,
    bottom: 40,
    left: 16,
    right: 16,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#101114',
    borderWidth: 1,
    borderColor: '#454A54',
    borderRadius: 99,
    paddingVertical: 16,
    paddingLeft: 32,
    paddingRight: 32,
    gap: 24,
  };

  const renderPill = () => {
    if (loadingActive) return null;

    if (activeShare) {
      const top = `${activeShare.boardStationName ?? '출발'} → ${activeShare.getOffStationName ?? '도착'}`;
      return (
        <Pressable
          onPress={() => router.replace('/getting-off-status' as any)}
          style={pillBaseStyle}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#7BA7FF', fontSize: 13, fontWeight: '600', marginBottom: 6 }}>
              {top}
            </Text>
            <Text style={{ color: colors.fg.DEFAULT, fontSize: 15, fontWeight: '500' }}>
              진행 중인 하차 공유
            </Text>
          </View>
          <Image
            source={require('../assets/images/shoes.png')}
            style={{ width: 56, height: 56 }}
            resizeMode="contain"
          />
        </Pressable>
      );
    }

    if (activeRequest) {
      const top = `${activeRequest.boardStationName ?? '출발'} → ${activeRequest.getOffStationName ?? '도착'}`;
      return (
        <Pressable
          onPress={() => router.replace('/seat-seekers' as any)}
          style={pillBaseStyle}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#7BA7FF', fontSize: 13, fontWeight: '600', marginBottom: 6 }}>
              {top}
            </Text>
            <Text style={{ color: colors.fg.DEFAULT, fontSize: 15, fontWeight: '500' }}>
              착석 희망 중
            </Text>
          </View>
          <Image
            source={require('../assets/images/shoes.png')}
            style={{ width: 56, height: 56 }}
            resizeMode="contain"
          />
        </Pressable>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.DEFAULT }} edges={['top']}>
      <TopBar variant="home" />
      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} contentContainerStyle={{ paddingTop: 32, gap: 12 }}>
        <View style={{ gap: 12 }}>
          <RoleCard
            title="곧 내려요"
            description="내 자리를 다른 사람에게 알려주세요."
            onPress={handleGettingOff}
            image={require('../assets/images/main_1.png')}
          />
          <RoleCard
            title="앉고 싶어요"
            description={'곧 내릴 사람을 먼저 확인하고\n편히 앉아가세요.'}
            onPress={handleWantSeat}
            image={require('../assets/images/main_2.png')}
          />
        </View>
      </ScrollView>

      {renderPill()}
    </SafeAreaView>
  );
}
