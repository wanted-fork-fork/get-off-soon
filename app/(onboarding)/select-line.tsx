import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '../../src/components/ui/TopBar';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Button } from '../../src/components/ui/Button';
import { BottomSheet } from '../../src/components/ui/BottomSheet';
import { useJourney } from '../../src/context/JourneyContext';
import { colors } from '../../src/constants/theme';
import Line2Svg from '../../assets/icons/line_2.svg';

type TrainOption = { id: string; label: string; sub: string };
const TRAIN_OPTIONS: TrainOption[] = [
  { id: 'prev-depart', label: '전역 출발', sub: '08:00 도착 예정' },
  { id: 'approaching', label: '당역 접근', sub: '07:58 도착' },
  { id: 'arrived', label: '당역 도착', sub: '07:55 도착' },
];

const SVG_VIEWBOX = { x: 0, y: 0, w: 1120, h: 588 };
const SVG_ASPECT = SVG_VIEWBOX.w / SVG_VIEWBOX.h;

type Station = { cx: number; cy: number; row: 'top' | 'bottom'; name: string };
const STATIONS: Station[] = [
  { cx: 308.5, cy: 122, row: 'top', name: '시청' },
  { cx: 341.5, cy: 109, row: 'top', name: '을지로입구' },
  { cx: 383.5, cy: 109, row: 'top', name: '을지로3가' },
  { cx: 434, cy: 112, row: 'top', name: '을지로4가' },
  { cx: 482, cy: 112, row: 'top', name: '동대문역사문화공원' },
  { cx: 531, cy: 109, row: 'top', name: '신당' },
  { cx: 588, cy: 112, row: 'top', name: '상왕십리' },
  { cx: 646, cy: 112, row: 'top', name: '왕십리' },
  { cx: 716, cy: 112, row: 'top', name: '한양대' },
  { cx: 781, cy: 112, row: 'top', name: '뚝섬' },
  { cx: 836, cy: 109, row: 'top', name: '성수' },
  { cx: 891, cy: 112, row: 'top', name: '건대입구' },
  { cx: 936.5, cy: 123, row: 'top', name: '구의' },
  { cx: 365.5, cy: 537, row: 'bottom', name: '사당' },
  { cx: 424, cy: 540, row: 'bottom', name: '방배' },
  { cx: 471.5, cy: 537, row: 'bottom', name: '서초' },
  { cx: 510.7, cy: 543.6, row: 'bottom', name: '교대' },
  { cx: 523.5, cy: 537, row: 'bottom', name: '강남' },
  { cx: 580.5, cy: 537, row: 'bottom', name: '역삼' },
  { cx: 622, cy: 540, row: 'bottom', name: '선릉' },
  { cx: 667.5, cy: 537, row: 'bottom', name: '삼성' },
  { cx: 711.5, cy: 537, row: 'bottom', name: '종합운동장' },
  { cx: 757, cy: 540, row: 'bottom', name: '잠실' },
  { cx: 823, cy: 540, row: 'bottom', name: '잠실나루' },
  { cx: 863.5, cy: 537, row: 'bottom', name: '강변' },
  { cx: 900, cy: 540, row: 'bottom', name: '구의' },
];

const HIT_W = 50;
const HIT_H = 80;

export default function SelectLineScreen() {
  const router = useRouter();
  const { state } = useJourney();
  const [contentHeight, setContentHeight] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState<string>('arrived');
  const [tappedStation, setTappedStation] = useState<string | null>(null);

  const handleNext = () => {
    setSheetOpen(false);
    router.push('/(onboarding)/select-station' as any);
  };

  const totalSteps = state.role === 'getting-off' ? 5 : 3;

  const svgWidth = contentHeight * SVG_ASPECT;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.DEFAULT }} edges={['top']}>
      <TopBar variant="back" onBack={() => router.back()} />
      <ProgressBar current={1} total={totalSteps} />

      <View style={{ paddingHorizontal: 16, paddingTop: 32, paddingBottom: 16 }}>
        <Text style={{ color: colors.fg.DEFAULT, fontSize: 18, fontWeight: '600' }}>
          현재 타고 있는 열차를{'\n'}선택해주세요.
        </Text>
      </View>

      <View style={{ flex: 1, paddingBottom: 60 }}>
        <View
          style={{ flex: 1 }}
          onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
        >
          {contentHeight > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ alignItems: 'center' }}
            >
              <View style={{ width: svgWidth, height: contentHeight }}>
                <Line2Svg
                  width={svgWidth}
                  height={contentHeight}
                  viewBox={`${SVG_VIEWBOX.x} ${SVG_VIEWBOX.y} ${SVG_VIEWBOX.w} ${SVG_VIEWBOX.h}`}
                />
                {STATIONS.map((s, i) => {
                  const scale = contentHeight / SVG_VIEWBOX.h;
                  const x = s.cx * scale - HIT_W / 2;
                  const y = s.row === 'top'
                    ? s.cy * scale - HIT_H + 12
                    : s.cy * scale - 12;
                  return (
                    <Pressable
                      key={i}
                      onPress={() => {
                        setTappedStation(s.name);
                        setSheetOpen(true);
                      }}
                      style={{
                        position: 'absolute',
                        left: x,
                        top: y,
                        width: HIT_W,
                        height: HIT_H,
                        borderWidth: 1,
                        borderColor: 'red',
                      }}
                    />
                  );
                })}
              </View>
            </ScrollView>
          )}
        </View>
      </View>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        {tappedStation && (
          <Text style={{ color: colors.accent.link, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
            {tappedStation}
          </Text>
        )}
        <Text style={{ color: colors.fg.DEFAULT, fontSize: 15, lineHeight: 22, marginBottom: 20 }}>
          아래 목록에서 탑승하고 있거나{'\n'}탑승 예정인 열차를 선택해주세요.
        </Text>

        <View style={{ gap: 10, marginBottom: 24 }}>
          {TRAIN_OPTIONS.map((opt) => {
            const selected = selectedTrain === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                activeOpacity={0.8}
                onPress={() => setSelectedTrain(opt.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: selected ? colors.accent.blue : 'transparent',
                  backgroundColor: colors.surface.input,
                }}
              >
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    borderWidth: 1.5,
                    borderColor: selected ? colors.accent.blue : colors.fg.muted,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  {selected && (
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: colors.accent.blue,
                      }}
                    />
                  )}
                </View>
                <Text
                  style={{
                    color: colors.fg.DEFAULT,
                    fontSize: 15,
                    fontWeight: '600',
                    marginRight: 8,
                  }}
                >
                  {opt.label}
                </Text>
                <Text style={{ color: colors.fg.secondary, fontSize: 13 }}>
                  {opt.sub}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button label="다음" onPress={handleNext} />
      </BottomSheet>
    </SafeAreaView>
  );
}
