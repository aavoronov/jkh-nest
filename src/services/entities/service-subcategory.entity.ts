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
import { ServiceCategory } from './service-category.entity';
import { Service } from './service.entity';

@Table
export class ServiceSubcategory extends Model<ServiceSubcategory> {
  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  subcategory: string;

  @BelongsTo(() => ServiceCategory)
  category: ServiceCategory;

  @ForeignKey(() => ServiceCategory)
  categoryId: number;

  @HasMany(() => Service)
  service: Service;
}
