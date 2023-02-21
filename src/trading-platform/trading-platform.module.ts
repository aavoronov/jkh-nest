import { Module } from '@nestjs/common';
import { TradingPlatformService } from './trading-platform.service';
import { TradingPlatformController } from './trading-platform.controller';

@Module({
  controllers: [TradingPlatformController],
  providers: [TradingPlatformService],
})
export class TradingPlatformModule {}
