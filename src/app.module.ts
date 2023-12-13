import { AdminModule } from '@adminjs/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatRoomsModule } from './chat-rooms/chat-rooms.module';
import { ChatModule } from './chat/chat.module';
import { authenticate } from './core/authenticate';
import { DatabaseModule } from './core/database/database.module';
import { componentLoader, resources } from './core/entities';
import { EstateObjectsModule } from './estate-objects/estate-objects.module';
import { MapObjectsModule } from './map-objects/map-objects.module';
import { PollsModule } from './polls/polls.module';
import { ServicesModule } from './services/services.module';
import { TradingPlatformModule } from './trading-platform/trading-platform.module';
import { UsersModule } from './users/users.module';
import { VerificationsModule } from './verifications/verifications.module';

import AdminJS from 'adminjs';
// import AdminBroSequelize = require('@admin-bro/sequelize');
import { Database, Resource } from '@adminjs/sequelize';
import { ScheduleModule } from '@nestjs/schedule';
import { ChatAdModule } from './chat-ad/chat-ad.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { GenericDataModule } from './generic-data/generic-data.module';
import { TasksModule } from './tasks/tasks.module';
import { TransactionsModule } from './transactions/transactions.module';
import { UtilitiesModule } from './utilities/utilities.module';
// import AdminJS from 'adminjs/types/src';

AdminJS.registerAdapter({ Database, Resource });

const modules = [
  DatabaseModule,
  UsersModule,
  VerificationsModule,
  ChatModule,
  MapObjectsModule,
  ChatRoomsModule,
  EstateObjectsModule,
  TradingPlatformModule,
  PollsModule,
  ServicesModule,
  ComplaintsModule,
  UtilitiesModule,
  TasksModule,
  TransactionsModule,
  GenericDataModule,
  ChatAdModule,
];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ...modules,
    AdminModule.createAdminAsync({
      useFactory: () => ({
        adminJsOptions: {
          rootPath: '/admin',
          resources: resources,
          componentLoader,
          env: {
            API_URL: process.env.API_URL,
            ADMIN_URL: process.env.ADMIN_URL,
          },
        },
        auth: {
          authenticate,
          cookieName: 'adminjs',
          cookiePassword: 'secretwhatwouldthatbe',
        },
        sessionOptions: {
          resave: true,
          saveUninitialized: true,
          secret: 'secretwhatever',
        },
      }),
      imports: [ConfigModule],
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(AuthMiddleware)
  //     .exclude({ path: '/', method: RequestMethod.GET })
  //     .forRoutes({ path: '*', method: RequestMethod.ALL });
  //   consumer
  //     .apply(AccessMiddleware)
  //     .exclude({ path: '/', method: RequestMethod.GET })
  //     // .forRoutes({ path: '*', method: RequestMethod.ALL });
  //     .forRoutes(AppController);
  // }
}
