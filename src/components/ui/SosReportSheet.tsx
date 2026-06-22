import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { colors } from '../../constants/theme';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import CallIcon from '../../../assets/icons/Call.svg';
import EmailIcon from '../../../assets/icons/Email.svg';

const REPORT_TYPES = [
  '너무 추워요', '너무 더워요',
  '물품판매', '소란행위',
  '형사범', '성추행',
  '불법촬영', '기타신고',
] as const;

const REPORT_TEMPLATES: Record<string, string> = {
  '너무 추워요': '객실 온도가 너무 낮아 춥습니다. 온도 조정을 요청합니다.',
  '너무 더워요': '객실 온도가 너무 높아 덥습니다. 온도 조정을 요청합니다.',
  '물품판매': '열차 내 무허가 물품판매가 진행 중입니다.',
  '소란행위': '열차 내 소란행위가 발생하고 있습니다.',
  '형사범': '열차 내 형사범죄가 의심되는 상황입니다.',
  '성추행': '열차 내 성추행이 발생했습니다. 즉시 조치 바랍니다.',
  '불법촬영': '열차 내 불법촬영이 의심됩니다. 즉시 조치 바랍니다.',
  '기타신고': '',
};

interface SosReportSheetProps {
  open: boolean;
  onClose: () => void;
  carNumbers?: number[];
  trainNo?: string | null;
  lineName?: string;
  phoneNumber?: string;
}

export function SosReportSheet({
  open,
  onClose,
  carNumbers = [],
  trainNo = null,
  lineName = '2호선',
  phoneNumber = '1577-1234',
}: SosReportSheetProps) {
  const [step, setStep] = useState<'menu' | 'types'>('menu');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  // 시트가 닫히면 다음 오픈을 위해 초기 단계로 되돌린다.
  useEffect(() => {
    if (!open) {
      setStep('menu');
      setSelectedReport(null);
    }
  }, [open]);

  const sendSms = () => {
    const carInfo = carNumbers.length > 0
      ? [...carNumbers].sort((a, b) => a - b).join(', ') + '호차'
      : '';
    const trainInfo = trainNo ? `${trainNo}열차` : '';
    const location = [lineName, trainInfo, carInfo].filter(Boolean).join(' ');
    const template = REPORT_TEMPLATES[selectedReport!] ?? '';
    const body = `[${selectedReport}] ${location}\n${template}`;
    onClose();
    Linking.openURL(`sms:${phoneNumber}&body=${encodeURIComponent(body)}`);
  };

  return (
    <BottomSheet open={open} onClose={onClose} showHandle={false}>
      {step === 'menu' ? (
        <>
          <Text style={{ color: colors.fg.DEFAULT, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
            열차에서 불편함을 느끼셨나요?
          </Text>
          <Text style={{ color: colors.fg.secondary, fontSize: 14, fontWeight: '400', marginBottom: 20 }}>
            담당 민원센터로 바로 연결해드릴게요.
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => { onClose(); Linking.openURL(`tel:${phoneNumber}`); }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#363C44', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 16, marginBottom: 8 }}
          >
            <CallIcon width={20} height={20} />
            <Text style={{ color: colors.fg.DEFAULT, fontSize: 15, fontWeight: '500', lineHeight: 15, letterSpacing: 15 * -0.015 }}>전화로 신고하기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setStep('types')}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#363C44', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 16, marginBottom: 20 }}
          >
            <EmailIcon width={20} height={20} />
            <Text style={{ color: colors.fg.DEFAULT, fontSize: 15, fontWeight: '500', lineHeight: 15, letterSpacing: 15 * -0.015 }}>문자로 신고하기</Text>
          </TouchableOpacity>

          <Button label="돌아가기" variant="outline" onPress={onClose} />
        </>
      ) : (
        <>
          <Text style={{ color: colors.fg.DEFAULT, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
            열차에서 불편함을 느끼셨나요?
          </Text>
          <Text style={{ color: colors.fg.secondary, fontSize: 14, fontWeight: '400', marginBottom: 20 }}>
            유형을 선택하면 신고 문자를 완성해드려요.
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {REPORT_TYPES.map((type) => {
              const selected = selectedReport === type;
              return (
                <TouchableOpacity
                  key={type}
                  activeOpacity={0.8}
                  onPress={() => setSelectedReport(selected ? null : type)}
                  style={{
                    flexBasis: '45%',
                    flexGrow: 1,
                    height: 56,
                    borderRadius: 12,
                    paddingVertical: 16,
                    paddingHorizontal: 12,
                    gap: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#2D3239',
                  }}
                >
                  <View style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: selected ? colors.accent.blue : '#484B51',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {selected && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent.blue }} />}
                  </View>
                  <Text style={{ color: colors.fg.DEFAULT, fontSize: 15, fontWeight: '400' }}>{type}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Button label="돌아가기" variant="outline" onPress={() => setStep('menu')} />
            </View>
            <View style={{ flex: 1 }}>
              <Button label="문자로 신고하기" onPress={sendSms} disabled={!selectedReport} />
            </View>
          </View>
        </>
      )}
    </BottomSheet>
  );
}
