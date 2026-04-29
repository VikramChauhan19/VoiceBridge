import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { palette } from '@/src/theme/colors';
import { SpeechRatePreset } from '@/src/store/appStore';

type SpeechRateSelectorProps = {
  value: SpeechRatePreset;
  onChange: (value: SpeechRatePreset) => void;
};

const presets: { key: SpeechRatePreset; labelKey: 'speechRateSlow' | 'speechRateNormal' | 'speechRateFast' }[] =
  [
    { key: 'slow', labelKey: 'speechRateSlow' },
    { key: 'normal', labelKey: 'speechRateNormal' },
    { key: 'fast', labelKey: 'speechRateFast' },
  ];

export function SpeechRateSelector({ value, onChange }: SpeechRateSelectorProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{t('speechRate')}</Text>
      <View style={styles.row}>
        {presets.map((item) => {
          const active = value === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => onChange(item.key)}
              accessibilityRole="button"
              accessibilityLabel={`${t('speechRate')} ${t(item.labelKey)}`}
              style={({ pressed }) => [
                styles.presetButton,
                active && styles.presetButtonActive,
                pressed && styles.presetButtonPressed,
              ]}
            >
              <Text style={[styles.presetLabel, active && styles.presetLabelActive]}>
                {t(item.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
    gap: 10,
  },
  title: {
    color: palette.text,
    fontSize: 20,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  presetButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    borderColor: palette.border,
    borderWidth: 1,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  presetButtonActive: {
    backgroundColor: palette.accentStrong,
    borderColor: palette.accent,
  },
  presetButtonPressed: {
    opacity: 0.85,
  },
  presetLabel: {
    color: palette.text,
    fontSize: 17,
    fontWeight: '700',
  },
  presetLabelActive: {
    color: '#FFFFFF',
  },
});
