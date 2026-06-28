import { Module } from '@nestjs/common';
import { BotController } from './bot.controller';
import { BotService } from './bot.service';
import { GroupHandler } from './handlers/group.handler';
import { PrivateHandler } from './handlers/private.handler';
import { PollHandler } from './handlers/poll.handler';
import { CommandRegistry } from './commands/command.registry';

@Module({
  controllers: [BotController],
  providers: [
    BotService,
    GroupHandler,
    PrivateHandler,
    PollHandler,
    CommandRegistry,
  ],
})
export class BotModule {}
