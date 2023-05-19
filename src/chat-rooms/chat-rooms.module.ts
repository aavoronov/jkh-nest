import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AccessMiddleware } from '../utils/middleware/access.middleware';
import { AuthMiddleware } from '../utils/middleware/auth.middleware';
import { ChatRoomsController } from './chat-rooms.controller';
import { ChatRoomsService } from './chat-rooms.service';

@Module({
  controllers: [ChatRoomsController],
  providers: [ChatRoomsService],
  exports: [ChatRoomsService],
})
export class ChatRoomsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: '/chat-rooms/', method: RequestMethod.ALL });
    consumer
      .apply(AccessMiddleware)
      .forRoutes({ path: '/chat-rooms/', method: RequestMethod.ALL });
  }
}
