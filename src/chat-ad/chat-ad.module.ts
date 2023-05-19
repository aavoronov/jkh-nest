import { Module } from '@nestjs/common';
import { TransactionsModule } from '../transactions/transactions.module';
import { ChatAdController } from './chat-ad.controller';
import { ChatAdService } from './chat-ad.service';

@Module({
  controllers: [ChatAdController],
  providers: [ChatAdService],
  imports: [TransactionsModule],
})
export class ChatAdModule {}
