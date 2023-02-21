import { ApiProperty } from '@nestjs/swagger';
import {
  Model,
  DataType,
  Table,
  Column,
  BelongsTo,
  ForeignKey,
  HasMany,
} from 'sequelize-typescript';
import { TradingPlatformCategory } from './trading-platform-category.entity';
import { TradingPlatformProduct } from './trading-platform-product.entity';

@Table
export class TradingPlatformSubcategory extends Model<TradingPlatformSubcategory> {
  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  subcategory: string;

  @BelongsTo(() => TradingPlatformCategory)
  category: TradingPlatformCategory;

  @ForeignKey(() => TradingPlatformCategory)
  categoryId: number;

  @HasMany(() => TradingPlatformProduct)
  product: TradingPlatformProduct;

  //   @HasMany(() => Message)
  //   messages: Message;
}
