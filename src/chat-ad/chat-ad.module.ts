import { Module } from '@nestjs/common';
import { ChatAdService } from './chat-ad.service';
import { ChatAdController } from './chat-ad.controller';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  controllers: [ChatAdController],
  providers: [ChatAdService],
  imports: [TransactionsModule],
})
export class ChatAdModule {}
