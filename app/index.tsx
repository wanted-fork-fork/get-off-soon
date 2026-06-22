import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, Pressable } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../src/constants/theme';
import { useJourney } from '../src/context/JourneyContext';
import { TopBar } from '../src/components/ui/TopBar';
import { RoleCard } from '../src/components/ui/RoleCard';
import { WelcomeOverlay } from '../src/components/ui/WelcomeOverlay';
import { getMySeatShare, getMySeatRequest, getSeatSharesMeRecentCompleted, getSeatRequestsMeRecentCompleted, getSeatSharesMeStatus, getSeatRequestsMeStatus, getRewards } from '../src/api/generated';
import CoinIcon from '../assets/icons/Coin.svg';
import type { GetMySeatShareResponse, GetMySeatRequestResponse } from '../src/api/generated';
import { ApiError } from '../src/api/client';
import { LINE_2_ID, LINE_2_STATIONS } from '../src/constants/subway';
import { SEAT_POSITION_TO_ZONE } from '../src/constants/seatZone';

type ActiveShare = NonNullable<GetMySeatShareResponse>;
type ActiveRequest = GetMySeatRequestResponse;

// 앱을 새로 켜서 홈에 처음 진입한 cold start 때만 진행 중인 여정 페이지로 자동 이동한다.
// 앱이 이미 켜져 있는 상태(여정 페이지에서 홈으로 복귀 등)에서는 자동 이동하지 않는다.
// JS 런타임은 cold start에서만 새로 뜨므로, 모듈 전역 플래그로 "최초 진입 1회"를 판별한다.
let didInitialRouting = false;

const ONBOARDING_SEEN_KEY = 'onboarding.welcomeSeen';

const JOURNEY_IN_PROGRESS_TEXT = '여정 중에는\n자리 정보 등록을 할 수 없어요.';
const JOURNEY_IN_PROGRESS_VIEW_TEXT = '여정 중에는\n자리 정보를 볼 수 없어요.';

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
  const [endedBanner, setEndedBanner] = useState<{ board: string; getOff: string } | null>(null);
  const [etaText, setEtaText] = useState<string | null>(null);
  const [welcomeVisible, setWelcomeVisible] = useState(false);
  const [rewardPoints, setRewardPoints] = useState<number | null>(null);

  // 메인 진입/복귀 시마다 보유 리워드 수를 갱신한다.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          const res = await getRewards();
          if (!cancelled) setRewardPoints(res.rewardPoints ?? 0);
        } catch (e) {
          if (e instanceof ApiError) return;
        }
      })();
      return () => {
        cancelled = true;
      };
    }, []),
  );

  // 온보딩 환영 오버레이는 한 번도 본 적 없는 유저에게만 1회 노출한다.
  useEffect(() => {
    (async () => {
      try {
        const seen = await AsyncStorage.getItem(ONBOARDING_SEEN_KEY);
        if (!seen) setWelcomeVisible(true);
      } catch {
        // 저장소 접근 실패 시 노출하지 않는다.
      }
    })();
  }, []);

  const handleWelcomeConfirm = useCallback(() => {
    setWelcomeVisible(false);
    // 본 것으로 기록 — 이후 다시 노출되지 않는다.
    AsyncStorage.setItem(ONBOARDING_SEEN_KEY, '1').catch(() => {});
  }, []);

  useEffect(() => {
    // 최초 홈 진입(cold start)인지 동기적으로 확정한다. 이후 홈 재진입은 warm으로 간주.
    const isColdStart = !didInitialRouting;
    didInitialRouting = true;
    (async () => {
      try {
        const [shareRes, requestRes] = await Promise.all([
          getMySeatShare(),
          getMySeatRequest(),
        ]);
        console.log('[home] getMySeatShare 응답:', JSON.stringify(shareRes, null, 2));
        console.log('[home] getMySeatRequest 응답:', JSON.stringify(requestRes, null, 2));

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
          if (isColdStart) {
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
          if (isColdStart) {
            router.replace('/seat-seekers' as any);
            return;
          }
        } else {
          const [latestShare, latestRequest] = await Promise.all([
            getSeatSharesMeRecentCompleted().catch(() => null),
            getSeatRequestsMeRecentCompleted().catch(() => null),
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

  // 진행 중인 여정(하차 공유·착석 희망)이 있으면 역할별 통합 status 폴링으로
  // 하차역까지 남은 정류장 수를 받아 "N정거장 뒤 도착" 문구를 만든다.
  const isShareJourney = !!activeShare;
  const hasActiveJourney = !!(activeShare ?? activeRequest);
  useEffect(() => {
    if (!hasActiveJourney) {
      setEtaText(null);
      return;
    }
    let cancelled = false;
    const fetchEta = async () => {
      try {
        const res = isShareJourney
          ? await getSeatSharesMeStatus()
          : await getSeatRequestsMeStatus();
        if (cancelled) return;
        if (res.phase === 'active' && res.progress) {
          const n = res.progress.remainingStops;
          if (res.progress.arrived || n === 0) setEtaText('곧 도착');
          else if (typeof n === 'number') setEtaText(`${n} 정거장 뒤 도착 예정입니다.`);
          else setEtaText(null);
        } else {
          setEtaText(null);
        }
      } catch (err) {
        if (err instanceof ApiError) return;
      }
    };
    fetchEta();
    const id = setInterval(fetchEta, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [hasActiveJourney, isShareJourney]);

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
    height: 80,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#2D3239',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0095F8',
    padding: 20,
    gap: 8,
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
            <Text style={{ color: '#0095F8', fontSize: 13, fontWeight: '600', marginBottom: 12 }}>
              {top}
            </Text>
            <Text style={{ color: colors.fg.DEFAULT, fontSize: 18, fontWeight: '600', lineHeight: 18, letterSpacing: -0.27 }}>
              {etaText ?? '도착 정보 확인 중'}
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
            <Text style={{ color: '#0095F8', fontSize: 13, fontWeight: '600', marginBottom: 12 }}>
              {top}
            </Text>
            <Text style={{ color: colors.fg.DEFAULT, fontSize: 18, fontWeight: '600', lineHeight: 18, letterSpacing: -0.27 }}>
              {etaText ?? '도착 정보 확인 중'}
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

    return null;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.DEFAULT }} edges={['top']}>
      <TopBar variant="home" />
      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} contentContainerStyle={{ paddingTop: 32, gap: 12 }}>
        <Pressable
          onPress={() => router.push('/reward-history' as any)}
          style={{
            alignSelf: 'flex-end',
            height: 32,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: '#363C44',
            borderRadius: 8,
            paddingTop: 4,
            paddingBottom: 4,
            paddingLeft: 6,
            paddingRight: 12,
          }}
        >
          <CoinIcon width={24} height={24} />
          <Text
            style={{
              color: '#E4E5E7',
              fontSize: 16,
              fontWeight: '600',
              lineHeight: 16,
              letterSpacing: 16 * -0.015,
              includeFontPadding: false,
              textAlignVertical: 'center',
            }}
          >
            {rewardPoints ?? 0}
          </Text>
        </Pressable>

        <View style={{ gap: 12 }}>
          <RoleCard
            title="곧 내려요"
            description="내 자리를 다른 사람에게 알려주세요."
            onPress={activeShare ? () => router.replace('/getting-off-status' as any) : handleGettingOff}
            image={require('../assets/images/main_1.png')}
            disabled={!!activeRequest}
            disabledText={JOURNEY_IN_PROGRESS_TEXT}
          />
          <RoleCard
            title="앉고 싶어요"
            description={'곧 내릴 사람을 먼저 확인하고\n편히 앉아가세요.'}
            onPress={activeRequest ? () => router.replace('/seat-seekers' as any) : handleWantSeat}
            image={require('../assets/images/main_2.png')}
            disabled={!!activeShare}
            disabledText={JOURNEY_IN_PROGRESS_VIEW_TEXT}
          />
        </View>
      </ScrollView>

      {renderPill()}

      <WelcomeOverlay visible={welcomeVisible} onConfirm={handleWelcomeConfirm} />
    </SafeAreaView>
  );
}
