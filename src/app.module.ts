import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './core/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { VerificationsModule } from './verifications/verifications.module';
import { ChatGateway } from './chat/chat.gateway';
import { ChatModule } from './chat/chat.module';
import { AuthMiddleware } from './utils/middleware/auth.middleware';
import { AccessMiddleware } from './utils/middleware/access.middleware';
import { ChatController } from './chat/chat.controller';
import { MapObjectsModule } from './map-objects/map-objects.module';
import { ChatRoomsModule } from './chat-rooms/chat-rooms.module';
import { EstateObjectsModule } from './estate-objects/estate-objects.module';
import { TradingPlatformModule } from './trading-platform/trading-platform.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UsersModule,
    VerificationsModule,
    ChatModule,
    MapObjectsModule,
    ChatRoomsModule,
    EstateObjectsModule,
    TradingPlatformModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(AuthMiddleware)
  //     .forRoutes({ path: '*', method: RequestMethod.ALL });
  //   consumer
  //     .apply(AccessMiddleware)
  //     .exclude(
  //       { path: 'api/v1/users', method: RequestMethod.POST },
  //       { path: 'api/v1/users/auth', method: RequestMethod.POST },
  //       { path: 'api/v1/users/confirm', method: RequestMethod.GET },
  //       { path: 'api/v1/users/restore', method: RequestMethod.POST },
  //       { path: 'api/v1/users/reauth', method: RequestMethod.GET },
  //       { path: '/uploads/*', method: RequestMethod.GET },
  //     )
  //     // .forRoutes({ path: '*', method: RequestMethod.ALL });
  //     .forRoutes(ChatController);
  // }
}
