import { Pressable, StyleSheet, Text } from 'react-native';
import { palette } from '@/src/theme/colors';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  accessibilityLabel: string;
  disabled?: boolean;
};

export function PrimaryButton({
  label,
  onPress,
  accessibilityLabel,
  disabled = false,
}: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, disabled && styles.disabled]}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 64,
    borderRadius: 20,
    backgroundColor: palette.accentStrong,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    color: palette.text,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
