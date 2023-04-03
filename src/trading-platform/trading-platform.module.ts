import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TradingPlatformService } from './trading-platform.service';
import { TradingPlatformController } from './trading-platform.controller';
import { AuthMiddleware } from '../utils/middleware/auth.middleware';
import { AccessMiddleware } from '../utils/middleware/access.middleware';
import { TransactionsService } from '../transactions/transactions.service';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  controllers: [TradingPlatformController],
  providers: [TradingPlatformService],
  imports: [TransactionsModule],
})
export class TradingPlatformModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: '/', method: RequestMethod.ALL });
    consumer
      .apply(AccessMiddleware)
      // .exclude(
      //   { path: '', method: RequestMethod.POST },
      // )
      .forRoutes({ path: '/', method: RequestMethod.ALL });
  }
}
