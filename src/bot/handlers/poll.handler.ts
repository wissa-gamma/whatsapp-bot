import { Injectable } from '@nestjs/common';
import { getAggregateVotesInPollMessage } from '@whiskeysockets/baileys';

@Injectable()
export class PollHandler {
  async handle(
    sock: any,
    events: any[],
    pollCache: Map<string, { msg: any; updates: any[] }>,
    executeCommand: (
      from: string,
      text: string,
      msg: any,
      isGroup: boolean,
    ) => Promise<void>,
  ) {
    for (const { key, update } of events) {
      if (update.pollUpdates && key.id && pollCache.has(key.id)) {
        const cacheData = pollCache.get(key.id)!;
        cacheData.updates.push(...update.pollUpdates);

        try {
          const votes = getAggregateVotesInPollMessage({
            message: cacheData.msg.message,
            pollUpdates: cacheData.updates,
          });

          const selected = votes.find((v: any) => v.voters.length > 0);
          if (selected) {
            const from = key.remoteJid!;
            const cmdText = selected.name;

            await sock.sendMessage(from, { delete: key });
            pollCache.delete(key.id);

            const isGroup = from.endsWith('@g.us');
            await executeCommand(from, cmdText, null, isGroup);
          }
        } catch (error) {
          console.error('Delete poll message error:', error);
        }
      }
    }
  }
}
