import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table
export class GenericData extends Model<GenericData> {
  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  key: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  value: any;
}
