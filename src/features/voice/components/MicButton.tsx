import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette } from '@/src/theme/colors';

type MicButtonProps = {
  isListening: boolean;
  disabled?: boolean;
  onPress: () => void;
};

export function MicButton({ isListening, disabled = false, onPress }: MicButtonProps) {
  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={isListening ? 'Stop microphone recording' : 'Start microphone recording'}
        style={({ pressed }) => [
          styles.button,
          isListening && styles.buttonActive,
          pressed && styles.pressed,
          disabled && styles.disabled,
        ]}>
        <MaterialIcons name="mic" size={62} color={palette.text} />
      </Pressable>
      <Text style={styles.label}>{isListening ? 'Listening...' : 'Tap Mic'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginBottom: 14,
  },
  button: {
    width: 132,
    height: 132,
    borderRadius: 66,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.accentStrong,
    borderWidth: 2,
    borderColor: palette.accent,
  },
  buttonActive: {
    backgroundColor: '#DC2626',
    borderColor: '#FCA5A5',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    color: palette.mutedText,
    fontSize: 16,
    marginTop: 10,
    fontWeight: '600',
  },
});
