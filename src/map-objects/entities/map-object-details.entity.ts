import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { MapObject } from './map-object.entity';

@Table
export class MapObjectDetails extends Model<MapObjectDetails> {
  @Column({
    type: DataType.STRING(1500),
  })
  name: string;

  @Column({
    type: DataType.STRING(1500),
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
  })
  images: string[];

  @Column({
    type: DataType.STRING,
  })
  phoneStationary: string;

  @Column({
    type: DataType.STRING,
  })
  phoneMobile: string;

  @Column({
    type: DataType.STRING,
  })
  address: string;

  @Column({
    type: DataType.STRING,
  })
  website: string;

  @ForeignKey(() => MapObject)
  objectId: number;

  @BelongsTo(() => MapObject)
  object: MapObject;
}
