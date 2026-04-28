import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { firestore } from '@/src/services/firebase/firebaseConfig';
import { ChatRecord, ChatWritePayload } from '@/src/services/firebase/types';

const roomsCollection = 'rooms';
const messagesCollection = 'messages';

function roomMessagesCollection(roomId: string) {
  return collection(firestore, roomsCollection, roomId, messagesCollection);
}

export async function createChatMessage(payload: ChatWritePayload): Promise<void> {
  const clean = payload.text.trim();
  if (!clean) return;

  await addDoc(roomMessagesCollection(payload.roomId), {
    text: clean,
    language: payload.language,
    source: payload.source,
    senderId: payload.senderId,
    createdAt: serverTimestamp(),
  });
}

export function subscribeRoomMessages(
  roomId: string,
  onUpdate: (messages: ChatRecord[]) => void,
  onError: (message: string) => void
) {
  const q = query(roomMessagesCollection(roomId), orderBy('createdAt', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs.map((item) => {
        const data = item.data() as {
          text: string;
          language: ChatRecord['language'];
          source: ChatRecord['source'];
          senderId: string;
          createdAt?: { toMillis: () => number };
        };

        return {
          id: item.id,
          roomId,
          text: data.text,
          language: data.language,
          source: data.source ?? 'typed',
          senderId: data.senderId,
          createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
        };
      });
      onUpdate(messages);
    },
    (error) => {
      console.error('Firestore onSnapshot error:', error);
      onError('Unable to connect to real-time chat stream.');
    }
  );
}

export async function clearRoomMessages(roomId: string): Promise<void> {
  const snapshot = await getDocs(roomMessagesCollection(roomId));
  await Promise.all(
    snapshot.docs.map((item) => {
      const messageRef = doc(firestore, roomsCollection, roomId, messagesCollection, item.id);
      return deleteDoc(messageRef);
    })
  );
}
