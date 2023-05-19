import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AccessMiddleware } from '../utils/middleware/access.middleware';
import { AuthMiddleware } from '../utils/middleware/auth.middleware';
import { MapObjectsController } from './map-objects.controller';
import { MapObjectsService } from './map-objects.service';

@Module({
  controllers: [MapObjectsController],
  providers: [MapObjectsService],
})
export class MapObjectsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: '/', method: RequestMethod.ALL });
    consumer
      .apply(AccessMiddleware)
      .exclude({ path: 'import/*', method: RequestMethod.GET })
      .forRoutes({ path: '/', method: RequestMethod.ALL });
  }
}
