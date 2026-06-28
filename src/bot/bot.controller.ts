import { Controller, Get, Res } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { BotService } from './bot.service';
import type { Response } from 'express';

@Controller('session')
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Get()
  async session(@Res() res: Response) {
    if (this.botService.isConnected) {
      return res.status(200).send({
        status: 'CONNECTED',
        message: 'Connected',
      });
    }

    if (this.botService.lastQr) {
      const qrBuffer = await QRCode.toBuffer(this.botService.lastQr);
      res.setHeader('Content-Type', 'image/png');
      return res.send(qrBuffer);
    }

    return res.status(503).send({
      status: 'INITIALIZING',
      message: 'Initializing',
    });
  }
}
