import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TradingPlatformService } from './trading-platform.service';
import { TradingPlatformController } from './trading-platform.controller';
import { AuthMiddleware } from '../utils/middleware/auth.middleware';
import { AccessMiddleware } from '../utils/middleware/access.middleware';

@Module({
  controllers: [TradingPlatformController],
  providers: [TradingPlatformService],
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
