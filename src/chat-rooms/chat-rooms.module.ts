import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ChatRoomsService } from './chat-rooms.service';
import { ChatRoomsController } from './chat-rooms.controller';
import { AuthMiddleware } from '../utils/middleware/auth.middleware';
import { AccessMiddleware } from '../utils/middleware/access.middleware';
@Module({
  controllers: [ChatRoomsController],
  providers: [ChatRoomsService],
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
