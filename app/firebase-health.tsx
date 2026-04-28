import { router } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { hasFirebaseConfig } from '@/src/config/env';
import { useAppStore } from '@/src/store/appStore';
import { PrimaryButton } from '@/src/shared/components/PrimaryButton';
import { palette } from '@/src/theme/colors';

export default function FirebaseHealthScreen() {
  const { isAuthReady, userId } = useAppStore();
  const readyForChat = hasFirebaseConfig && isAuthReady && Boolean(userId);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Firebase Health Check</Text>
      <Text style={styles.subtitle}>Startup backend validation before opening Voice Bridge chat.</Text>

      <View style={styles.card}>
        <Row label="Config loaded" value={hasFirebaseConfig ? 'Yes' : 'No'} ok={hasFirebaseConfig} />
        <Row label="Auth initialized" value={isAuthReady ? 'Yes' : 'Pending'} ok={isAuthReady} />
        <Row label="User session" value={userId ? 'Available' : 'Pending'} ok={Boolean(userId)} />
      </View>

      {!readyForChat ? (
        <View style={styles.pending}>
          <ActivityIndicator size="small" color={palette.accent} />
          <Text style={styles.pendingText}>
            {hasFirebaseConfig
              ? 'Connecting Firebase authentication...'
              : 'Firebase keys missing in app.json > expo.extra'}
          </Text>
        </View>
      ) : null}

      <PrimaryButton
        label={readyForChat ? 'Open Voice Bridge Chat' : 'Open App (Limited Mode)'}
        accessibilityLabel="Continue to application tabs"
        onPress={() => router.replace('/(tabs)')}
      />
    </View>
  );
}

function Row({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, ok ? styles.ok : styles.warn]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
    padding: 18,
    justifyContent: 'center',
  },
  title: {
    color: palette.text,
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: palette.mutedText,
    fontSize: 16,
    marginBottom: 16,
  },
  card: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  rowLabel: {
    color: palette.text,
    fontSize: 17,
    fontWeight: '600',
  },
  rowValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  ok: {
    color: '#22C55E',
  },
  warn: {
    color: '#F59E0B',
  },
  pending: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  pendingText: {
    color: palette.mutedText,
    fontSize: 14,
    fontWeight: '600',
  },
});
