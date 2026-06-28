import { Injectable } from '@nestjs/common';

@Injectable()
export class GroupHandler {
  async handle(
    sock: any,
    from: string,
    msg: any,
    groupPermissions: Record<string, string[]>,
    executeCommand: (
      from: string,
      text: string,
      msg: any,
      isGroup: boolean,
    ) => Promise<void>,
  ) {
    const message = msg.message;
    if (!message || message.pollUpdateMessage) return;

    const allowedCommands = groupPermissions[from];
    if (!allowedCommands) return;

    const text =
      message?.conversation ||
      message?.extendedTextMessage?.text ||
      message?.imageMessage?.caption ||
      message?.videoMessage?.caption ||
      '';

    if (!text || !text.startsWith('.')) return;

    const [cmdWithPrefix] = text.split(' ');
    const cmd = cmdWithPrefix.slice(1);

    if (!allowedCommands.includes(cmd)) {
      await sock.sendMessage(from, { text: `*.${cmd}* Not Allowed!` });
      return;
    }

    await executeCommand(from, text, msg, true);
  }
}
