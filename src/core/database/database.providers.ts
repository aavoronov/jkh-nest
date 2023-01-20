import { Sequelize } from 'sequelize-typescript';
import { User } from '../../../src/users/entities/user.entity';
import { Profile } from '../../../src/users/entities/profile.entity';
// import { User } from '/src/users/entities/user.entity';
import { SEQUELIZE, DEVELOPMENT, TEST, PRODUCTION } from '../constants';
import { databaseConfig } from './database.config';
import { Verifications } from '../../verifications/entities/verification.entity';
import { Message } from '../../../src/chat/entities/message.entity';
import { MapObject } from '../../../src/map-objects/entities/map-object.entity';
import { ChatRoom } from '../../../src/chat-rooms/entities/chat-room.entity';
import { RoomAccess } from '../../../src/chat-rooms/entities/room-access.entity';

const entities: any[] = [
  User,
  Profile,
  Verifications,
  Message,
  ChatRoom,
  RoomAccess,
  MapObject,
];

export const databaseProviders = [
  {
    provide: SEQUELIZE,
    useFactory: async () => {
      let config;
      switch (process.env.NODE_ENV) {
        case DEVELOPMENT:
          config = databaseConfig.development;
          break;
        case TEST:
          config = databaseConfig.test;
          break;
        case PRODUCTION:
          config = databaseConfig.production;
          break;
        default:
          config = databaseConfig.development;
      }
      const sequelize = new Sequelize(config);
      sequelize.addModels(entities);
      await sequelize.sync();
      // await sequelize.sync({ force: true });
      return sequelize;
    },
  },
];
