import { Injectable } from '@nestjs/common';
import { ICommand } from './command.interface';

@Injectable()
export class CommandRegistry {
  private commands: Map<string, ICommand> = new Map();

  constructor() {
    this.registerAllCommands();
  }

  private register(cmd: ICommand) {
    this.commands.set(cmd.name, cmd);
  }

  public get(name: string): ICommand | undefined {
    return this.commands.get(name);
  }

  private registerAllCommands() {
    this.register({
      name: 'ping',
      category: 'SYS',
      desc: 'Check Bot Status',
      onlyGroup: false,
      exec: async (sock, from) => {
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);

        const res =
          `*Bot Status*\n──────────────\n` +
          `➤ \`\`\`Status    \`\`\` :: ONLINE\n` +
          `➤ \`\`\`Uptime    \`\`\` :: ${hours}h ${minutes}m\n` +
          `──────────────`;
        await sock.sendMessage(from, { text: res });
      },
    });

    // --- Next Command ---
    // this.register({
    //   name: '#',
    //   category: '#',
    //   desc: '#',
    //   onlyGroup: false,
    //   exec: async (sock, from, args) => { ... }
    // });
  }
}
