import { ApiProperty } from '@nestjs/swagger';
import { Model, DataType, Table, Column, HasMany } from 'sequelize-typescript';
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
