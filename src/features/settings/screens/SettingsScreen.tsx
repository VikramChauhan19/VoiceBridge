import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { hasFirebaseConfig } from '@/src/config/env';
import { useAppStore } from '@/src/store/appStore';
import { palette } from '@/src/theme/colors';

export function SettingsScreen() {
  const { t } = useTranslation();
  const { language } = useAppStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('accessibility')}</Text>
      <Text style={styles.item}>{t('largeButtons')}</Text>
      <Text style={styles.item}>
        {t('language')}: {language === 'en' ? t('english') : t('hindi')}
      </Text>
      <Text style={styles.item}>
        Firebase: {hasFirebaseConfig ? 'Configured' : 'Not configured'}
      </Text>
      {!hasFirebaseConfig ? <Text style={styles.hint}>{t('firebaseHint')}</Text> : null}
      <Text style={styles.item}>{t('aiVoice')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
    padding: 18,
    gap: 12,
  },
  title: {
    color: palette.text,
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 6,
  },
  item: {
    color: palette.text,
    fontSize: 20,
    lineHeight: 30,
    backgroundColor: palette.surface,
    borderRadius: 14,
    borderColor: palette.border,
    borderWidth: 1,
    padding: 14,
  },
  hint: {
    color: palette.mutedText,
    fontSize: 15,
  },
});
