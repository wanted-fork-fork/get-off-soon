import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/constants/theme';
import { useJourney } from '../src/context/JourneyContext';
import { TopBar } from '../src/components/ui/TopBar';
import { RoleCard } from '../src/components/ui/RoleCard';
import { getMySeatShare, getMySeatRequest, getMe, getSeatSharesMeLatestCompleted, getSeatRequestsMeLatestCompleted } from '../src/api/generated';
import type { GetMySeatShareResponse, GetMySeatRequestResponse } from '../src/api/generated';
import { ApiError } from '../src/api/client';
import { LINE_2_ID, LINE_2_STATIONS } from '../src/constants/subway';
import { SEAT_POSITION_TO_ZONE } from '../src/constants/seatZone';

const GUEST_PROVIDERS = new Set(['dev', 'guest', 'anonymous', '']);
function isSocialProvider(provider: string | undefined | null): boolean {
  if (!provider) return false;
  return !GUEST_PROVIDERS.has(provider.toLowerCase());
}

type ActiveShare = NonNullable<GetMySeatShareResponse>;
type ActiveRequest = GetMySeatRequestResponse;

// cold start 시 1회만 자동 라우팅. 이후 사용자가 홈으로 돌아오면 끌고가지 않음.
let didAutoRedirect = false;

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
    reset,
  } = useJourney();

  const [activeShare, setActiveShare] = useState<ActiveShare | null>(null);
  const [activeRequest, setActiveRequest] = useState<ActiveRequest | null>(null);
  const [loadingActive, setLoadingActive] = useState(true);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [endedBanner, setEndedBanner] = useState<{ board: string; getOff: string } | null>(null);

  useEffect(() => {
    getMe()
      .then((me) => setLoggedIn(isSocialProvider(me.provider)))
      .catch(() => setLoggedIn(false));
  }, []);

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
          if (!didAutoRedirect) {
            didAutoRedirect = true;
            router.replace('/getting-off-status' as any);
            return;
          }
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
          if (!didAutoRedirect) {
            didAutoRedirect = true;
            router.replace('/seat-seekers' as any);
            return;
          }
        } else {
          const [latestShare, latestRequest] = await Promise.all([
            getSeatSharesMeLatestCompleted().catch(() => null),
            getSeatRequestsMeLatestCompleted().catch(() => null),
          ]);
          const shareTime = latestShare?.completedAt ? new Date(latestShare.completedAt).getTime() : 0;
          const requestTime = latestRequest?.completedAt ? new Date(latestRequest.completedAt).getTime() : 0;
          const latest = shareTime >= requestTime ? latestShare : latestRequest;
          if (latest) {
            setEndedBanner({
              board: latest.boardStation?.name ?? '',
              getOff: latest.getOffStation?.name ?? '',
            });
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
    reset();
    setRole('getting-off');
    router.push('/(onboarding)/select-line' as any);
  };

  const handleWantSeat = () => {
    reset();
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

    if (endedBanner) {
      const { board, getOff } = endedBanner;
      const top = board && getOff ? `${board} → ${getOff}` : board || getOff;
      return (
        <Pressable
          onPress={() => setEndedBanner(null)}
          style={pillBaseStyle}
        >
          <View style={{ flex: 1 }}>
            {top ? (
              <Text style={{ color: '#7BA7FF', fontSize: 13, fontWeight: '600', marginBottom: 6 }}>
                {top}
              </Text>
            ) : null}
            <Text style={{ color: colors.fg.DEFAULT, fontSize: 15, fontWeight: '500' }}>
              여정을 종료했습니다.
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

    if (loggedIn === false) {
      return (
        <Pressable
          onPress={() => router.push('/login' as any)}
          style={{
            position: 'absolute',
            bottom: 40,
            left: 16,
            right: 16,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#2D3239',
            borderRadius: 12,
            padding: 20,
            gap: 8,
          }}
        >
          <View style={{ flex: 1, gap: 8 }}>
            <Text style={{ color: colors.fg.DEFAULT, fontSize: 14, fontWeight: '600', letterSpacing: 14 * -0.015 }}>
              회원 가입 시 2 리워드 지급!
            </Text>
            <Text style={{ color: colors.fg.DEFAULT, fontSize: 18, fontWeight: '600', letterSpacing: 18 * -0.015 }}>
              로그인하고 두 번 더 앉아가세요.
            </Text>
          </View>
          <Image
            source={require('../assets/images/check_badge.png')}
            style={{ width: 48, height: 48 }}
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
