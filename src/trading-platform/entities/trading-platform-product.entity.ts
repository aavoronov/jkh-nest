import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { TradingPlatformCategory } from './trading-platform-category.entity';
import { TradingPlatformSubcategory } from './trading-platform-subcategory.entity';
import { TradingPlatformFavorites } from './trading-platform-favorites.entity';

@Table
export class TradingPlatformProduct extends Model<TradingPlatformProduct> {
  // @BelongsTo(() => User)
  // user: User;

  // @ForeignKey(() => User)
  // userId: number;

  @BelongsTo(() => TradingPlatformSubcategory)
  subcategory: TradingPlatformSubcategory;

  @ForeignKey(() => TradingPlatformSubcategory)
  subcategoryId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => User)
  userId: number;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  price: string;

  @ApiProperty()
  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
  })
  images: string[];

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  description: string;

  @ApiProperty()
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  condition: number;

  @ApiProperty()
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  wts: boolean;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  location: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  phone: string;

  @ApiProperty()
  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
  })
  hasWhatsapp: boolean;

  @ApiProperty()
  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
  })
  hasTelegram: boolean;

  @ApiProperty()
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  views: number;

  @ApiProperty()
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  isPaidUntil: Date;

  @ApiProperty()
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  isVip: boolean;

  @HasMany(() => TradingPlatformFavorites)
  favorites: TradingPlatformFavorites;

  //   @HasMany(() => Message)
  //   messages: Message;
}
