import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { TradingPlatformSubcategory } from './trading-platform-subcategory.entity';

@Table
export class TradingPlatformCategory extends Model<TradingPlatformCategory> {
  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  category: string;

  @HasMany(() => TradingPlatformSubcategory)
  subcategory: TradingPlatformSubcategory;

  //   @HasMany(() => Message)
  //   messages: Message;
}
