import { useEffect, useMemo, useState } from 'react';
import { ConversationCoordinator } from '@/src/features/conversation/services/conversationCoordinator';
import { firebaseConversationTransport } from '@/src/features/conversation/services/firebaseConversationTransport';
import { ConversationTurn } from '@/src/features/conversation/types';

export function useConversationFlow() {
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const coordinator = useMemo(
    () => new ConversationCoordinator(firebaseConversationTransport),
    []
  );

  useEffect(() => {
    const unsubscribe = coordinator.watchTurns((turn) => {
      setTurns((prev) => {
        const exists = prev.some((item) => item.id === turn.id);
        if (exists) return prev;
        return [...prev, turn];
      });
    });
    return unsubscribe;
  }, [coordinator]);

  return {
    turns,
    sendTurn: coordinator.sendTurn.bind(coordinator),
  };
}
