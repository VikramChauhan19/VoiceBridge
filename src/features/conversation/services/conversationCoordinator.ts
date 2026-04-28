import { ConversationTransport, ConversationTurn } from '@/src/features/conversation/types';

export class ConversationCoordinator {
  constructor(private readonly transport: ConversationTransport) {}

  async sendTurn(turn: ConversationTurn): Promise<void> {
    await this.transport.publishTurn(turn);
  }

  watchTurns(onTurn: (turn: ConversationTurn) => void): () => void {
    return this.transport.subscribeTurns(onTurn);
  }
}
