import { ChatMessage, MessageSource, SupportedLanguage } from '@/src/types';
import {
  clearRoomMessages,
  createChatMessage,
  subscribeRoomMessages,
} from '@/src/services/firebase/chatService';

const CHAT_ROOM_ID = 'voice-bridge';

export function subscribeChat(
  onUpdate: (messages: ChatMessage[]) => void,
  onError: (message: string) => void
) {
  return subscribeRoomMessages(
    CHAT_ROOM_ID,
    (messages) =>
      onUpdate(
        messages.map((item) => ({
          id: item.id,
          text: item.text,
          language: item.language,
          senderId: item.senderId,
          source: item.source,
          createdAt: item.createdAt,
        }))
      ),
    onError
  );
}

export async function sendChatMessage(params: {
  text: string;
  language: SupportedLanguage;
  senderId: string;
  source: MessageSource;
}) {
  await createChatMessage({
    roomId: CHAT_ROOM_ID,
    text: params.text,
    language: params.language,
    senderId: params.senderId,
    source: params.source,
  });
}

export async function clearChatMessages(): Promise<void> {
  await clearRoomMessages(CHAT_ROOM_ID);
}
