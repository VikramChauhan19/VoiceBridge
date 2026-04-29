import { useBridgeChatController } from "@/src/features/chat/hooks/useBridgeChatController";
import { PrimaryButton } from "@/src/shared/components/PrimaryButton";
import { LanguageSelector } from "@/src/shared/components/LanguageSelector";
import { SpeechRateSelector } from "@/src/shared/components/SpeechRateSelector";
import { palette } from "@/src/theme/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
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
  const { t, i18n } = useTranslation();
  const {
    language,
    setLanguage,
    speechRate,
    setSpeechRate,
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
    streamError,
  } = useBridgeChatController();

  useEffect(() => {
    void i18n.changeLanguage(language);
  }, [i18n, language]);

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
        <LanguageSelector selectedLanguage={language} onChangeLanguage={setLanguage} />
        <SpeechRateSelector value={speechRate} onChange={setSpeechRate} />
        <View style={styles.statusStrip}>
          <Text style={styles.statusStripText}>
            {streamError ? streamError : t("chatSyncLive")}
          </Text>
          <Text style={styles.statusStripText}>
            {speech.isListening ? t("listeningNow") : t("listeningStopped")}
          </Text>
        </View>
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
                    void speakWithAiStyle(item.text, item.language, speechRate)
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
        <View style={styles.composerRow}>
          <TextInput
            value={messageText}
            onChangeText={setMessageText}
            placeholder={t("chatInputPlaceholder")}
            placeholderTextColor={palette.mutedText}
            style={styles.input}
            accessibilityLabel="Chat message input"
            multiline
          />
          <Pressable
            style={({ pressed }) => [
              styles.micBtn,
              speech.isListening && styles.micBtnActive,
              pressed && styles.micBtnPressed,
              !speech.isSupported && styles.micBtnDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel={speech.isListening ? "Stop listening" : "Start listening"}
            onPress={() =>
              void (speech.isListening ? Promise.resolve(speech.stopListening()) : speech.startListening())
            }
            disabled={!speech.isSupported}
          >
            <MaterialIcons
              name={speech.isListening ? "stop" : "mic"}
              size={22}
              color={palette.text}
            />
          </Pressable>
        </View>
        {statusError ? <Text style={styles.errorText}>{statusError}</Text> : null}
        <View style={styles.quickActionsRow}>
          <View style={styles.quickActionItem}>
            <PrimaryButton
              label={speech.isListening ? t("stopListening") : t("startListening")}
              accessibilityLabel={speech.isListening ? "Stop listening to voice" : "Start listening to voice"}
              onPress={() =>
                void (speech.isListening ? Promise.resolve(speech.stopListening()) : speech.startListening())
              }
              disabled={!speech.isSupported}
            />
          </View>
          <View style={styles.quickActionItem}>
            <PrimaryButton
              label={t("stopSpeech")}
              accessibilityLabel="Stop speech output"
              onPress={() => void stopCurrentSpeech()}
              disabled={!isSpeakingNow}
            />
          </View>
        </View>
        <View style={styles.quickActionsRow}>
          <View style={styles.quickActionItem}>
            <PrimaryButton
              label={isClearing ? `${t("clearChat")}...` : t("clearChat")}
              accessibilityLabel="Clear full chat history"
              onPress={() => void clearChat()}
              disabled={isClearing}
            />
          </View>
        </View>
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
  statusStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: palette.surface,
    borderRadius: 14,
    borderColor: palette.border,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  statusStripText: {
    color: palette.success,
    fontSize: 14,
    fontWeight: "700",
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
    width: 44,
    height: 44,
    borderRadius: 22,
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
    flex: 1,
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
  },
  composerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    marginBottom: 12,
  },
  micBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  micBtnActive: {
    backgroundColor: "#DC2626",
    borderColor: "#FCA5A5",
  },
  micBtnPressed: {
    opacity: 0.85,
  },
  micBtnDisabled: {
    opacity: 0.5,
  },
  errorText: {
    color: palette.danger,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  quickActionItem: {
    flex: 1,
  },
});
