import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { MulterModule } from '@nestjs/platform-express';
import { AuthMiddleware } from '../utils/middleware/auth.middleware';
import { AccessMiddleware } from '../utils/middleware/access.middleware';
import { ChatRoomsService } from '../chat-rooms/chat-rooms.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, ChatRoomsService],
})
export class ChatModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: '/chat/', method: RequestMethod.ALL });
    consumer
      .apply(AccessMiddleware)
      .exclude({ path: '/uploads/*', method: RequestMethod.GET })
      .forRoutes({ path: '/chat/', method: RequestMethod.ALL });
  }
}
