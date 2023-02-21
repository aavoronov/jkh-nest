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

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  @Column({
    defaultValue: 'user',
    values: ['user', 'worker1', 'worker2', 'admin'],
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
}
