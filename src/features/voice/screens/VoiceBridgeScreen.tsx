import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MicButton } from '@/src/features/voice/components/MicButton';
import { useWebSpeechToText } from '@/src/features/voice/hooks/useWebSpeechToText';
import { speakWithAiStyle } from '@/src/features/voice/services/textToSpeech';
import { useAppStore } from '@/src/store/appStore';
import { PrimaryButton } from '@/src/shared/components/PrimaryButton';
import { palette } from '@/src/theme/colors';

export function VoiceBridgeScreen() {
  const { t, i18n } = useTranslation();
  const { language, setLanguage } = useAppStore();
  const [text, setText] = useState('');
  const speech = useWebSpeechToText(language);

  useEffect(() => {
    void i18n.changeLanguage(language);
  }, [i18n, language]);

  useEffect(() => {
    const mergedText = `${speech.finalText} ${speech.liveText}`.trim();
    if (mergedText) {
      setText(mergedText);
    }
  }, [speech.finalText, speech.liveText]);

  const onSpeak = async () => {
    await speakWithAiStyle(text, language);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('appTitle')}</Text>
      <Text style={styles.subtitle}>{t('appSubtitle')}</Text>

      <View style={styles.toggleRow}>
        <PrimaryButton
          label={t('english')}
          accessibilityLabel="Switch language to English"
          onPress={() => setLanguage('en')}
          disabled={language === 'en'}
        />
        <PrimaryButton
          label={t('hindi')}
          accessibilityLabel="Switch language to Hindi"
          onPress={() => setLanguage('hi')}
          disabled={language === 'hi'}
        />
      </View>

      <Text style={styles.sectionTitle}>{t('speechToText')}</Text>
      <MicButton
        isListening={speech.isListening}
        onPress={() => (speech.isListening ? speech.stopListening() : speech.startListening())}
        disabled={!speech.isSupported}
      />

      <View style={styles.controls}>
        <PrimaryButton
          label={t('startListening')}
          accessibilityLabel="Start listening"
          onPress={speech.startListening}
          disabled={!speech.isSupported || speech.isListening}
        />
        <PrimaryButton
          label={t('stopListening')}
          accessibilityLabel="Stop listening"
          onPress={speech.stopListening}
          disabled={!speech.isListening}
        />
      </View>

      <View style={styles.statusCard}>
        {!speech.isSupported && speech.availabilityReason ? (
          <Text style={styles.warningText}>{speech.availabilityReason}</Text>
        ) : null}
        {speech.error ? <Text style={styles.errorText}>{speech.error}</Text> : null}
        {speech.liveText ? <Text style={styles.liveText}>{speech.liveText}</Text> : null}
      </View>

      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        multiline
        placeholder={t('typeMessage')}
        placeholderTextColor={palette.mutedText}
        accessibilityLabel="Message text input"
      />

      <Text style={styles.sectionTitle}>{t('textToSpeech')}</Text>
      <PrimaryButton
        label={t('speakText')}
        accessibilityLabel="Convert text to voice"
        onPress={onSpeak}
        disabled={!text.trim()}
      />
      <PrimaryButton
        label={t('clearText')}
        accessibilityLabel="Clear recognized and typed text"
        onPress={() => {
          speech.clear();
          setText('');
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    color: palette.text,
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: palette.mutedText,
    fontSize: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 10,
  },
  toggleRow: {
    gap: 6,
  },
  controls: {
    marginTop: 6,
  },
  statusCard: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    minHeight: 54,
  },
  warningText: {
    color: '#F59E0B',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  errorText: {
    color: palette.danger,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  liveText: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '600',
  },
  input: {
    minHeight: 160,
    backgroundColor: palette.surface,
    color: palette.text,
    fontSize: 20,
    borderRadius: 16,
    borderColor: palette.border,
    borderWidth: 1,
    padding: 16,
    textAlignVertical: 'top',
    marginBottom: 14,
  },
});
