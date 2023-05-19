import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AccessMiddleware } from '../utils/middleware/access.middleware';
import { AuthMiddleware } from '../utils/middleware/auth.middleware';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: '/', method: RequestMethod.ALL });
    consumer
      .apply(AccessMiddleware)
      .exclude(
        { path: '', method: RequestMethod.POST },
        { path: 'auth', method: RequestMethod.POST },
        { path: 'confirm', method: RequestMethod.GET },
        { path: 'restore', method: RequestMethod.POST },
        { path: 'reauth', method: RequestMethod.GET },
      )
      .forRoutes({ path: '/', method: RequestMethod.ALL });
  }
}
