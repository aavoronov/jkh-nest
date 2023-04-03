import {
  Table,
  Column,
  Model,
  DataType,
  HasOne,
  HasMany,
} from 'sequelize-typescript';
import { Verifications } from '../../verifications/entities/verification.entity';
import { Profile } from './profile.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Message } from '../../chat/entities/message.entity';
import { EstateObjectRights } from '../../estate-objects/entities/estate-object-rights.entity';
import { TradingPlatformFavorites } from '../../trading-platform/entities/trading-platform-favorites.entity';
import { WorkerProfile } from './worker-profile.entity';
import { TradingPlatformProduct } from '../../trading-platform/entities/trading-platform-product.entity';
import { Service } from '../../services/entities/service.entity';
import { MapObjectReview } from '../../map-objects/entities/map-object-review.entity';
import { MapObjectReply } from '../../map-objects/entities/map-object-reply.entity';
import { ServiceReview } from '../../services/entities/service-review';

@Table
export class User extends Model<User> {
  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: true,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: true,
  })
  phone: string;

  // @Column({
  //   type: DataType.ENUM,
  //   unique: true,
  //   allowNull: true,
  // })
  // sex: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  @Column({
    defaultValue: 'user',
    values: [
      'user',
      'uk',
      'upravdom',
      'admakers',
      'stores',
      'business',
      'admin',
    ],
  })
  @ApiProperty()
  role: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  })
  @ApiProperty()
  isDeleted: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  })
  @ApiProperty()
  isBlocked: boolean;

  @HasOne(() => Profile)
  profile: Profile;

  @HasOne(() => Verifications)
  verification: Verifications;

  @HasMany(() => Message)
  messages: Message;

  @HasMany(() => EstateObjectRights)
  estateObjectRight: EstateObjectRights;

  @HasMany(() => TradingPlatformFavorites)
  favorites: TradingPlatformFavorites;

  @HasMany(() => TradingPlatformProduct)
  tradingPlatformProducts: TradingPlatformProduct;

  @HasMany(() => Service)
  services: Service;

  @HasMany(() => MapObjectReview)
  mapObjectReviews: MapObjectReview;

  @HasMany(() => MapObjectReply)
  mapObjectReplies: MapObjectReply;

  @HasMany(() => ServiceReview)
  serviceReviews: ServiceReview;

  @HasOne(() => WorkerProfile)
  workerProfile: WorkerProfile;
}
