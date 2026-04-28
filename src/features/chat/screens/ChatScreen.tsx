import { useBridgeChatController } from "@/src/features/chat/hooks/useBridgeChatController";
import { PrimaryButton } from "@/src/shared/components/PrimaryButton";
import { palette } from "@/src/theme/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import {
    KeyboardAvoidingView, Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";

function formatMessageTime(timestampMs: number): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestampMs));
}

export function ChatScreen() {
  const { t } = useTranslation();
  const {
    language,
    messages,
    userId,
    messageText,
    setMessageText,
    sendAndSpeak,
    speakWithAiStyle,
    stopCurrentSpeech,
    clearChat,
    isSending,
    isClearing,
    isSpeakingNow,
    speech,
    statusError,
  } = useBridgeChatController();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        {messages.map((item) => {
          const mine = item.senderId === userId;
          return (
            <View
              key={item.id}
              style={[styles.bubble, mine ? styles.mine : styles.theirs]}
            >
              <Text style={styles.messageText}>{item.text}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.meta}>
                  {mine ? t("userA") : t("userB")} -{" "}
                  {item.language.toUpperCase()} -{" "}
                  {item.source === "spoken" ? t("spoken") : t("typed")} -{" "}
                  {formatMessageTime(item.createdAt)}
                </Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.speakBtn,
                    pressed && styles.speakBtnPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Speak this chat message"
                  onPress={() =>
                    void speakWithAiStyle(item.text, item.language)
                  }
                >
                  <MaterialIcons
                    name="volume-up"
                    size={20}
                    color={palette.text}
                  />
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          value={messageText}
          onChangeText={setMessageText}
          placeholder={t("chatInputPlaceholder")}
          placeholderTextColor={palette.mutedText}
          style={styles.input}
          accessibilityLabel="Chat message input"
          multiline
        />
        <PrimaryButton
          label={isSending ? t("sending") : t("sendAndSpeak")}
          accessibilityLabel="Send and speak chat message"
          onPress={() => void sendAndSpeak(messageText)}
          disabled={!messageText.trim() || isSending}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
    padding: 16,
    paddingTop: 20,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: 10,
    paddingBottom: 120, // Ensure last messages are visible above input bar
  },
  bubble: {
    maxWidth: "84%",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
  },
  mine: {
    alignSelf: "flex-end",
    backgroundColor: palette.accentStrong,
  },
  theirs: {
    alignSelf: "flex-start",
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderWidth: 1,
  },
  messageText: {
    color: palette.text,
    fontSize: 19,
    fontWeight: "600",
  },
  metaRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  meta: {
    color: palette.mutedText,
    fontSize: 12,
    fontWeight: "700",
  },
  speakBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  speakBtnPressed: {
    opacity: 0.8,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: palette.border,
    backgroundColor: palette.background,
    padding: 8,
  },
  input: {
    minHeight: 78,
    borderRadius: 16,
    borderColor: palette.border,
    borderWidth: 1,
    backgroundColor: palette.surface,
    color: palette.text,
    fontSize: 20,
    paddingHorizontal: 16,
    paddingTop: 14,
    textAlignVertical: "top",
    marginBottom: 12,
  },
});
