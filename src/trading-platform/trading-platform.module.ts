import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TransactionsModule } from '../transactions/transactions.module';
import { AccessMiddleware } from '../utils/middleware/access.middleware';
import { AuthMiddleware } from '../utils/middleware/auth.middleware';
import { TradingPlatformController } from './trading-platform.controller';
import { TradingPlatformService } from './trading-platform.service';

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
