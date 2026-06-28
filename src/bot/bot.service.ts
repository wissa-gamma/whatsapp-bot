import { Injectable, OnModuleInit } from '@nestjs/common';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import pino from 'pino';
import { GroupHandler } from './handlers/group.handler';
import { PrivateHandler } from './handlers/private.handler';
import { PollHandler } from './handlers/poll.handler';
import { CommandRegistry } from './commands/command.registry';

@Injectable()
export class BotService implements OnModuleInit {
  private sock: any;
  public lastQr: string | null = null;
  public isConnected: boolean = false;

  // Cache
  private pollCache: Map<string, { msg: any; updates: any[] }> = new Map();

  // Permission Group
  private GROUP_PERMISSIONS: Record<string, string[]> = {};

  constructor(
    private readonly groupHandler: GroupHandler,
    private readonly privateHandler: PrivateHandler,
    private readonly pollHandler: PollHandler,
    private readonly commandRegistry: CommandRegistry,
  ) {}

  async onModuleInit() {
    this.GROUP_PERMISSIONS = this.parseAllowedGroups();
    await this.initBot();
  }

  private parseAllowedGroups(): Record<string, string[]> {
    const raw = process.env.ALLOWED_GROUPS;
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('Not Valid Variable');
      return {};
    }
  }

  // Main Function
  async initBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const { version } = await fetchLatestBaileysVersion();

    this.sock = makeWASocket({
      auth: state,
      version,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: true,
      browser: ['Bot', 'Chrome', '1.0.0'],

      getMessage: async (key: any) => {
        if (key.id && this.pollCache.has(key.id)) {
          return this.pollCache.get(key.id)!.msg.message;
        }
        return undefined;
      },
    });

    this.sock.ev.on('connection.update', async (update: any) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        this.lastQr = qr;
        this.isConnected = false;
      }

      if (connection === 'open') {
        console.log('➤ WhatsApp Connected!');
        this.lastQr = null;
        this.isConnected = true;
      }

      if (connection === 'close') {
        this.isConnected = false;
        const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
        console.log(`➤ Connection closed: ${statusCode}`);

        if (statusCode !== DisconnectReason.loggedOut) {
          console.log('➤ Reconnecting...');
          setTimeout(() => this.initBot(), 3000);
        } else {
          console.log('➤ Logged Out');
          this.lastQr = null;
        }
      }
    });

    this.sock.ev.on('creds.update', saveCreds);

    this.sock.ev.on('messages.update', async (events: any[]) => {
      await this.pollHandler.handle(
        this.sock,
        events,
        this.pollCache,
        this.executeCommand.bind(this),
      );
    });

    this.sock.ev.on('messages.upsert', async ({ messages }) => {
      const msg = messages[0];
      if (!msg?.message || msg.key.fromMe) return;

      const from = msg.key.remoteJid;

      if (from.endsWith('@g.us')) {
        await this.groupHandler.handle(
          this.sock,
          from,
          msg,
          this.GROUP_PERMISSIONS,
          this.executeCommand.bind(this),
        );
      } else {
        await this.privateHandler.handle(
          this.sock,
          from,
          msg,
          this.pollCache,
          this.executeCommand.bind(this),
        );
      }
    });
  }

  public async executeCommand(
    from: string,
    text: string,
    msg: any,
    isGroup: boolean,
  ) {
    if (!text || typeof text !== 'string') return;

    const cleanText = text.trim();

    const prefixMatch = cleanText.match(/^[./!#]/);
    const prefix = prefixMatch ? prefixMatch[0] : null;

    if (prefix) {
      const args = cleanText.split(/\s+/);
      const cmdWithPrefix = args.shift();

      if (!cmdWithPrefix) return;

      const cmdName = cmdWithPrefix.slice(prefix.length).toLowerCase().trim();

      console.log(
        `➤ [DEBUG] Command Received: ${cmdName} | From: ${from} | IsGroup: ${isGroup}`,
      );
      if (cmdName === 'menu' || cmdName === 'help') {
        const menuText =
          `*M E N U*\n` +
          `━━━\n` +
          `➢ *.ping* \n` +
          `━━━\n` +
          `_Select a Command_`;

        const imageUrl =
          'https://avatars.githubusercontent.com/u/297682086?s=400&u=3453af21b03e1bc931eaa0a40c63518981eec9af&v=4';

        try {
          await this.sock.sendMessage(
            from,
            {
              image: { url: imageUrl },
              caption: menuText,
            },
            { quoted: msg },
          );
        } catch (error) {
          console.error(
            '➤ [DEBUG] Error Send Image Menu: ',
            error,
          );
          await this.sock.sendMessage(from, { text: menuText });
        }
        return;
      }

      const commandObj = this.commandRegistry.get(cmdName);

      if (commandObj) {
        if (commandObj.onlyGroup && !isGroup) {
          await this.sock.sendMessage(
            from,
            {
              text: `Only available in groups.`,
            },
            { quoted: msg },
          );
          return;
        }

        try {
          await commandObj.exec(this.sock, from, args, msg);
        } catch (error) {
          console.error(`Error executing command '${cmdName}':`, error);
        }
      } else if (!isGroup) {
        await this.sock.sendMessage(
          from,
          {
            text: `Command Not Found!`,
          },
          { quoted: msg },
        );
      }
    }
  }
}
