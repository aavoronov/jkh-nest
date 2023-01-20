import { Module } from '@nestjs/common';
import { MapObjectsService } from './map-objects.service';
import { MapObjectsController } from './map-objects.controller';

@Module({
  controllers: [MapObjectsController],
  providers: [MapObjectsService],
})
export class MapObjectsModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(AuthMiddleware)
  //     .forRoutes({ path: '/users/', method: RequestMethod.ALL });
  //   consumer
  //     .apply(AccessMiddleware)
  //     .exclude(
  //       { path: '/', method: RequestMethod.POST },
  //       { path: 'auth', method: RequestMethod.POST },
  //       { path: 'confirm', method: RequestMethod.GET },
  //       { path: 'restore', method: RequestMethod.POST },
  //       { path: 'reauth', method: RequestMethod.GET },
  //       // { path: '/uploads/*', method: RequestMethod.GET },
  //     )
  //     .forRoutes({ path: '/users/', method: RequestMethod.ALL });
  //   // .forRoutes(UsersController);
  // }
}
