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

type Station = { cx: number; cy: number; name: string };
const STATIONS: Station[] = [
  { cx: 909.5, cy: 33.3, name: '용두' },
  { cx: 869, cy: 41, name: '신설동' },
  { cx: 997.5, cy: 56, name: '신답' },
  { cx: 310.5, cy: 122, name: '이대' },
  { cx: 343.5, cy: 109, name: '아현' },
  { cx: 385.5, cy: 109, name: '충정로' },
  { cx: 432, cy: 112, name: '시청' },
  { cx: 480, cy: 112, name: '을지로입구' },
  { cx: 533, cy: 109, name: '을지로3가' },
  { cx: 586, cy: 112, name: '을지로4가' },
  { cx: 644, cy: 112, name: '동대문역사문화공원' },
  { cx: 714, cy: 112, name: '신당' },
  { cx: 779, cy: 112, name: '상왕십리' },
  { cx: 838, cy: 109, name: '왕십리' },
  { cx: 889, cy: 112, name: '한양대' },
  { cx: 938.5, cy: 123, name: '뚝섬' },
  { cx: 282, cy: 149, name: '신촌' },
  { cx: 997.5, cy: 135, name: '성수' },
  { cx: 966.5, cy: 150, name: '용답' },
  { cx: 95, cy: 171, name: '까치산' },
  { cx: 994, cy: 182, name: '건대입구' },
  { cx: 248, cy: 186, name: '홍대입구' },
  { cx: 994, cy: 228, name: '구의' },
  { cx: 247, cy: 236, name: '합정' },
  { cx: 104.5, cy: 251, name: '신정네거리' },
  { cx: 997.5, cy: 264, name: '강변' },
  { cx: 152.5, cy: 299, name: '양천구청' },
  { cx: 997.5, cy: 300, name: '잠실나루' },
  { cx: 247, cy: 305, name: '당산' },
  { cx: 997.5, cy: 340, name: '잠실' },
  { cx: 251.5, cy: 347, name: '영등포구청' },
  { cx: 201.5, cy: 349, name: '도림천' },
  { cx: 994, cy: 384, name: '잠실새내' },
  { cx: 247, cy: 398, name: '문래' },
  { cx: 997.5, cy: 417, name: '종합운동장' },
  { cx: 994, cy: 466, name: '삼성' },
  { cx: 247, cy: 467, name: '신도림' },
  { cx: 959.5, cy: 501, name: '선릉' },
  { cx: 290.5, cy: 504, name: '대림' },
  { cx: 367.5, cy: 537, name: '구로디지털단지' },
  { cx: 422, cy: 540, name: '신대방' },
  { cx: 473.5, cy: 537, name: '신림' },
  { cx: 525.5, cy: 537, name: '봉천' },
  { cx: 582.5, cy: 537, name: '서울대입구' },
  { cx: 620, cy: 540, name: '낙성대' },
  { cx: 669.5, cy: 537, name: '사당' },
  { cx: 713.5, cy: 537, name: '방배' },
  { cx: 755, cy: 540, name: '서초' },
  { cx: 821, cy: 540, name: '교대' },
  { cx: 865.5, cy: 537, name: '강남' },
  { cx: 898, cy: 540, name: '역삼' },
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
                  const y = s.cy * scale - HIT_H / 2;
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
