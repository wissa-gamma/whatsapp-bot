import { Injectable } from '@nestjs/common';

@Injectable()
export class PrivateHandler {
  async handle(
    sock: any,
    from: string,
    msg: any,
    pollCache: Map<string, any>,
    executeCommand: (
      from: string,
      text: string,
      msg: any,
      isGroup: boolean,
    ) => Promise<void>,
  ) {
    const message = msg.message;
    if (!message || message.pollUpdateMessage) return;

    const text =
      message?.conversation ||
      message?.extendedTextMessage?.text ||
      message?.imageMessage?.caption ||
      message?.videoMessage?.caption ||
      '';

    if (!text) return;

    if (!text.match(/^[./!#]/)) {
      await sock.sendMessage(from, {
        text: 'Hello World!',
      });
      return;
    }
    await executeCommand(from, text, msg, false);
  }
}
