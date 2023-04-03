import { ApiProperty } from '@nestjs/swagger';
import { Model, DataType, Table, Column, HasMany } from 'sequelize-typescript';
import { ServiceSubcategory } from './service-subcategory.entity';

@Table
export class ServiceCategory extends Model<ServiceCategory> {
  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  category: string;

  @HasMany(() => ServiceSubcategory)
  subcategory: ServiceSubcategory;
}
