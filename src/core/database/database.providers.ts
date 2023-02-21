import { Sequelize } from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { Profile } from '../../users/entities/profile.entity';
// import { User } from '/src/users/entities/user.entity';
import { SEQUELIZE, DEVELOPMENT, TEST, PRODUCTION } from '../constants';
import { databaseConfig } from './database.config';
import { Verifications } from '../../verifications/entities/verification.entity';
import { Message } from '../../chat/entities/message.entity';
import { MapObject } from '../../map-objects/entities/map-object.entity';
import { ChatRoom } from '../../chat-rooms/entities/chat-room.entity';
import { RoomAccess } from '../../chat-rooms/entities/room-access.entity';
import { EstateObject } from '../../estate-objects/entities/estate-object.entity';
import { EstateObjectRights } from '../../estate-objects/entities/estate-object-rights.entity';
import { TradingPlatformCategory } from '../../trading-platform/entities/trading-platform-category.entity';
import { TradingPlatformProduct } from '../../trading-platform/entities/trading-platform-product.entity';
import { TradingPlatformSubcategory } from '../../trading-platform/entities/trading-platform-subcategory.entity';
import { TradingPlatformFavorites } from '../../trading-platform/entities/trading-platform-favorites.entity';

const entities: any[] = [
  User,
  Profile,
  Verifications,
  Message,
  ChatRoom,
  RoomAccess,
  MapObject,
  EstateObject,
  EstateObjectRights,
  TradingPlatformCategory,
  TradingPlatformSubcategory,
  TradingPlatformProduct,
  TradingPlatformFavorites,
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
