import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useJourney } from '../../src/context/JourneyContext';
import { colors } from '../../src/constants/theme';
import { STATION_BY_NAME } from '../../src/constants/subway';
import Line2Svg from '../../assets/icons/line_2.svg';

const SVG_VIEWBOX = { x: 0, y: 0, w: 1120, h: 588 };
const SVG_ASPECT = SVG_VIEWBOX.w / SVG_VIEWBOX.h;

type Station = { cx: number; cy: number; name: string };
const STATIONS: Station[] = [
  { cx: 909.5, cy: 33.3, name: '용두' },
  { cx: 869, cy: 41, name: '신설동' },
  { cx: 997.5, cy: 56, name: '신답' },
  { cx: 343.5, cy: 109, name: '이대' },
  { cx: 385.5, cy: 109, name: '아현' },
  { cx: 533, cy: 109, name: '을지로입구' },
  { cx: 838, cy: 109, name: '상왕십리' },
  { cx: 432, cy: 112, name: '충정로' },
  { cx: 480, cy: 112, name: '시청' },
  { cx: 586, cy: 112, name: '을지로3가' },
  { cx: 644, cy: 112, name: '을지로4가' },
  { cx: 714, cy: 112, name: '동대문역사문화공원' },
  { cx: 779, cy: 112, name: '신당' },
  { cx: 889, cy: 112, name: '왕십리' },
  { cx: 310.5, cy: 122, name: '신촌' },
  { cx: 938.5, cy: 123, name: '한양대' },
  { cx: 997.5, cy: 135, name: '용답' },
  { cx: 282, cy: 149, name: '홍대입구' },
  { cx: 966.5, cy: 150, name: '뚝섬' },
  { cx: 95, cy: 171, name: '까치산' },
  { cx: 994, cy: 182, name: '성수' },
  { cx: 248, cy: 186, name: '합정' },
  { cx: 994, cy: 228, name: '건대입구' },
  { cx: 247, cy: 236, name: '당산' },
  { cx: 104.5, cy: 251, name: '신정네거리' },
  { cx: 997.5, cy: 264, name: '구의' },
  { cx: 152.5, cy: 299, name: '양천구청' },
  { cx: 997.5, cy: 300, name: '강변' },
  { cx: 247, cy: 305, name: '영등포구청' },
  { cx: 997.5, cy: 340, name: '잠실나루' },
  { cx: 251.5, cy: 347, name: '문래' },
  { cx: 201.5, cy: 349, name: '도림천' },
  { cx: 994, cy: 384, name: '잠실' },
  { cx: 247, cy: 398, name: '신도림' },
  { cx: 997.5, cy: 417, name: '잠실새내' },
  { cx: 994, cy: 466, name: '종합운동장' },
  { cx: 247, cy: 467, name: '대림' },
  { cx: 959.5, cy: 501, name: '삼성' },
  { cx: 290.5, cy: 504, name: '구로디지털단지' },
  { cx: 367.5, cy: 537, name: '신대방' },
  { cx: 473.5, cy: 537, name: '봉천' },
  { cx: 525.5, cy: 537, name: '서울대입구' },
  { cx: 582.5, cy: 537, name: '낙성대' },
  { cx: 669.5, cy: 537, name: '방배' },
  { cx: 713.5, cy: 537, name: '서초' },
  { cx: 865.5, cy: 537, name: '역삼' },
  { cx: 422, cy: 540, name: '신림' },
  { cx: 620, cy: 540, name: '사당' },
  { cx: 755, cy: 540, name: '교대' },
  { cx: 821, cy: 540, name: '강남' },
  { cx: 898, cy: 540, name: '선릉' },
];

const HIT_W = 50;
const HIT_H = 50;

const TOOLTIP_W = 130;
const TOOLTIP_H = 64;
const TOOLTIP_GAP = 10;

export default function SelectStationScreen() {
  const router = useRouter();
  const { setStation } = useJourney();
  const [contentHeight, setContentHeight] = useState(0);
  const [tappedIndex, setTappedIndex] = useState<number | null>(null);

  const svgWidth = contentHeight * SVG_ASPECT;
  const scale = contentHeight > 0 ? contentHeight / SVG_VIEWBOX.h : 0;
  const tapped = tappedIndex != null ? STATIONS[tappedIndex] : null;

  const handleConfirm = () => {
    if (!tapped) return;
    const station = STATION_BY_NAME[tapped.name];
    if (!station) return;
    setStation(station.id);
    router.push('/(onboarding)/select-car' as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface.DEFAULT }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 32, paddingBottom: 16 }}>
        <Text style={{ color: colors.fg.DEFAULT, fontSize: 18, fontWeight: '600' }}>
          하차 예정인 역을 선택해주세요.
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
                  const x = s.cx * scale - HIT_W / 2;
                  const y = s.cy * scale - HIT_H / 2;
                  return (
                    <Pressable
                      key={i}
                      onPress={() => setTappedIndex(i)}
                      style={{ position: 'absolute', left: x, top: y, width: HIT_W, height: HIT_H }}
                    />
                  );
                })}

                {tapped && (() => {
                  const stationX = tapped.cx * scale;
                  const stationY = tapped.cy * scale;
                  const showBelow = stationY - TOOLTIP_H - TOOLTIP_GAP - 8 < 0;
                  const tooltipTop = showBelow
                    ? stationY + TOOLTIP_GAP + 8
                    : stationY - TOOLTIP_H - TOOLTIP_GAP;
                  const tooltipLeft = Math.max(
                    4,
                    Math.min(stationX - TOOLTIP_W / 2, svgWidth - TOOLTIP_W - 4),
                  );
                  const pointerLeft = stationX - tooltipLeft - 6;
                  return (
                    <Pressable
                      onPress={handleConfirm}
                      style={{
                        position: 'absolute',
                        left: tooltipLeft,
                        top: tooltipTop,
                        width: TOOLTIP_W,
                        height: TOOLTIP_H,
                        borderRadius: 12,
                        backgroundColor: colors.accent.blue,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: 10,
                      }}
                    >
                      <Text
                        style={{ color: colors.white, fontSize: 14, fontWeight: '700', marginBottom: 2 }}
                        numberOfLines={1}
                      >
                        {tapped.name}
                      </Text>
                      <Text style={{ color: colors.white, fontSize: 12 }}>
                        여기서 내릴게요
                      </Text>
                      <View
                        style={{
                          position: 'absolute',
                          left: pointerLeft,
                          [showBelow ? 'top' : 'bottom']: -5,
                          width: 12,
                          height: 12,
                          backgroundColor: colors.accent.blue,
                          transform: [{ rotate: '45deg' }],
                        }}
                      />
                    </Pressable>
                  );
                })()}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </View>
  );
}
