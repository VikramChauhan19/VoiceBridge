import { ConversationTransport, ConversationTurn } from '@/src/features/conversation/types';
import { sendChatMessage, subscribeChat } from '@/src/features/chat/services/chatService';

export const firebaseConversationTransport: ConversationTransport = {
  publishTurn: async (turn) => {
    await sendChatMessage({
      text: turn.text,
      language: turn.language,
      senderId: turn.senderId,
      source: turn.direction === 'speech_to_text' ? 'spoken' : 'typed',
    });
  },
  subscribeTurns: (onTurn) => {
    return subscribeChat(
      (messages) => {
        const latest = messages[messages.length - 1];
        if (!latest) return;

        const mappedTurn: ConversationTurn = {
          id: latest.id,
          text: latest.text,
          language: latest.language,
          createdAt: latest.createdAt,
          senderId: latest.senderId,
          direction: 'speech_to_text',
        };
        onTurn(mappedTurn);
      },
      () => {
        // Chat service already owns retry behavior and UI error handling.
      }
    );
  },
};
