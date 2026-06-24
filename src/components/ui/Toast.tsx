// ──────────────────────────────────────────────────────
// ToastProvider — errorBus를 구독해 API 에러를 토스트로 안내한다.
// 같은 메시지는 dedup 윈도우 내 1회만, 자동 dismiss.
// ──────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { errorBus } from '../../api/errorBus';
import { toUserMessage } from '../../api/errorMessages';
import { colors } from '../../constants/theme';

const DISMISS_MS = 3500; // 자동 사라짐
const DEDUP_MS = 5000; // 같은 메시지 억제 윈도우
const ANIM_MS = 180; // 기존 화면 전환 톤과 일관

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState<string | null>(null);

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  const lastShownRef = useRef<{ message: string; at: number } | null>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = errorBus.subscribe((err) => {
      const text = toUserMessage(err);
      const now = Date.now();
      const last = lastShownRef.current;
      // 같은 메시지가 dedup 윈도우 내에 다시 오면 무시(폴링 스팸 방지 안전망)
      if (last && last.message === text && now - last.at < DEDUP_MS) return;
      lastShownRef.current = { message: text, at: now };
      setMessage(text);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (message == null) return;

    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: ANIM_MS, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: ANIM_MS, useNativeDriver: true }),
    ]).start();

    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    dismissTimer.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: ANIM_MS, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 12, duration: ANIM_MS, useNativeDriver: true }),
      ]).start(() => setMessage(null));
    }, DISMISS_MS);

    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [message, opacity, translateY]);

  return (
    <>
      {children}
      {message != null && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.wrap,
            { bottom: insets.bottom + 24, opacity, transform: [{ translateY }] },
          ]}
        >
          <View style={styles.toast}>
            <Text style={styles.text}>{message}</Text>
          </View>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  toast: {
    maxWidth: '100%',
    backgroundColor: colors.surface.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  text: {
    color: colors.fg.DEFAULT,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
