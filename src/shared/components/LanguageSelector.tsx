import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PrimaryButton } from '@/src/shared/components/PrimaryButton';
import { SupportedLanguage } from '@/src/types';
import { palette } from '@/src/theme/colors';

type LanguageSelectorProps = {
  selectedLanguage: SupportedLanguage;
  onChangeLanguage: (language: SupportedLanguage) => void;
};

export function LanguageSelector({
  selectedLanguage,
  onChangeLanguage,
}: LanguageSelectorProps) {
  const { t } = useTranslation();

  return (
    <View
      style={styles.wrapper}
      accessibilityLabel={t('currentLanguage', { language: selectedLanguage === 'en' ? t('english') : t('hindi') })}
    >
      <Text style={styles.heading}>{t('language')}</Text>
      <View style={styles.row}>
        <View style={styles.button}>
          <PrimaryButton
            label={t('english')}
            accessibilityLabel="Switch language to English"
            onPress={() => onChangeLanguage('en')}
            disabled={selectedLanguage === 'en'}
          />
        </View>
        <View style={styles.button}>
          <PrimaryButton
            label={t('hindi')}
            accessibilityLabel="Switch language to Hindi"
            onPress={() => onChangeLanguage('hi')}
            disabled={selectedLanguage === 'hi'}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
    gap: 10,
  },
  heading: {
    color: palette.text,
    fontSize: 20,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
  },
});
