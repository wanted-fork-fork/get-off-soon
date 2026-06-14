import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, Animated, Easing, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from './Button';

interface WelcomeOverlayProps {
  visible: boolean;
  reward?: number;
  onConfirm: () => void;
}

const COIN_WIDTH = 132;
const COIN_HEIGHT = Math.round((COIN_WIDTH * 402) / 426); // 원본 비율 426x402

// 피그마 계측: 코인 박스 174x142 안에서 X10 배지 = 폭 67 / 높이 38, 좌측 91 / 상단 74
const FIGMA_COIN_W = 174;
const FIGMA_COIN_H = 142;
const BADGE_WIDTH = Math.round((67 / FIGMA_COIN_W) * COIN_WIDTH); // ≈51
const BADGE_HEIGHT = Math.round((BADGE_WIDTH * 114) / 201); // 배지 원본 비율 201x114 유지 ≈29
const BADGE_LEFT = Math.round((91 / FIGMA_COIN_W) * COIN_WIDTH); // ≈69
const BADGE_TOP = Math.round((74 / FIGMA_COIN_H) * COIN_HEIGHT); // ≈65

// 코인은 살짝 왼쪽, X10 배지는 살짝 오른쪽으로 벌려 배치
const COIN_OFFSET_X = 8;
const BADGE_OFFSET_X = 8;

// description 스펙: Pretendard Light(300) / 20px / line-height 150% / letter-spacing -1.5%
const descriptionStyle = {
  color: '#FFFFFF',
  fontSize: 20,
  fontWeight: '300' as const,
  lineHeight: 30,
  letterSpacing: 20 * -0.015,
  textAlign: 'center' as const,
};

/**
 * 최초 진입 환영 오버레이.
 * 딤은 즉시 깔리고, 그 위에서 순차 애니메이션이 진행된다.
 * 1) "환영합니다!" 500ms ease-out 페이드인
 * 2) 코인이 아래에서 위로 솟아오름
 * 3) 코인이 자리 잡으면 X10 배지·설명·버튼이 100ms ease-out 페이드인
 *
 * 내용물(WelcomeContent)은 열릴 때마다 새로 마운트되므로
 * 애니메이션 값이 항상 숨김(opacity 0) 상태에서 시작한다.
 */
export function WelcomeOverlay({ visible, reward = 10, onConfirm }: WelcomeOverlayProps) {
  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onConfirm} statusBarTranslucent>
      {visible ? <WelcomeContent reward={reward} onConfirm={onConfirm} /> : null}
    </Modal>
  );
}

function WelcomeContent({ reward, onConfirm }: { reward: number; onConfirm: () => void }) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  // 마운트 시점에 숨김 상태로 초기화 — 이 컴포넌트는 오버레이가 열릴 때마다 새로 마운트된다.
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const coinOpacity = useRef(new Animated.Value(0)).current;
  const coinTranslateY = useRef(new Animated.Value(height * 0.18)).current; // 화면 아래쪽에서 시작
  const contentOpacity = useRef(new Animated.Value(0)).current;

  const overlayOpacity = useRef(new Animated.Value(1)).current;

  const startedRef = useRef(false);
  const closingRef = useRef(false);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  // 닫을 때 전체 오버레이를 300ms 페이드아웃한 뒤 실제로 닫는다.
  const handleClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onConfirm();
    });
  };

  // 모달 콘텐츠의 네이티브 뷰가 attach된 뒤(첫 레이아웃) 애니메이션을 시작해야
  // 네이티브 드라이버가 앞부분 프레임을 누락하지 않는다.
  const startAnimation = () => {
    if (startedRef.current) return;
    startedRef.current = true;

    const animation = Animated.sequence([
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(coinTranslateY, {
          toValue: 0,
          duration: 450,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(coinOpacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 100,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]);

    animationRef.current = animation;
    animation.start();
  };

  useEffect(() => () => animationRef.current?.stop(), []);

  return (
    <Animated.View
      onLayout={startAnimation}
      style={{ flex: 1, backgroundColor: '#1B1D22B2', paddingHorizontal: 24, opacity: overlayOpacity }}
    >
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.Text
          style={{
            opacity: titleOpacity,
            color: '#0095F8',
            fontSize: 26,
            fontWeight: '700',
            letterSpacing: 26 * -0.015,
            marginBottom: 40,
          }}
        >
          환영합니다!
        </Animated.Text>

        <View style={{ width: COIN_WIDTH, height: COIN_HEIGHT }}>
          <Animated.Image
            source={require('../../../assets/images/coin.png')}
            resizeMode="contain"
            style={{
              width: COIN_WIDTH,
              height: COIN_HEIGHT,
              opacity: coinOpacity,
              transform: [{ translateX: -COIN_OFFSET_X }, { translateY: coinTranslateY }],
            }}
          />
          <Animated.Image
            source={require('../../../assets/images/coin_x10.png')}
            resizeMode="contain"
            style={{
              position: 'absolute',
              left: BADGE_LEFT + BADGE_OFFSET_X,
              top: BADGE_TOP,
              width: BADGE_WIDTH,
              height: BADGE_HEIGHT,
              opacity: contentOpacity,
            }}
          />
        </View>

        <Animated.View style={{ opacity: contentOpacity, marginTop: 48, alignItems: 'center' }}>
          <Text style={descriptionStyle}>
            {'이동 여정에 타고타고와\n함께해주셔서 감사합니다.'}
          </Text>
          <Text style={[descriptionStyle, { marginTop: 16 }]}>
            감사 의미로{' '}
            <Text style={{ color: '#0095F8' }}>{reward} 리워드</Text>
            {` 드릴게요,\n편히 앉아 가는데 사용하세요!`}
          </Text>
        </Animated.View>
      </View>

      <Animated.View style={{ opacity: contentOpacity, paddingBottom: insets.bottom + 20 }}>
        <Button label={`${reward} 리워드 받고 시작하기`} onPress={handleClose} />
      </Animated.View>
    </Animated.View>
  );
}
