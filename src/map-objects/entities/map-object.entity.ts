import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  HasOne,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { MapObjectDetails } from './map-object-details.entity';
import { MapObjectReview } from './map-object-review.entity';

@Table
export class MapObject extends Model<MapObject> {
  @Column({
    type: DataType.GEOMETRY('Point'),
  })
  point: any;

  @Column({
    type: DataType.STRING,
  })
  category: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isApproved: boolean;

  @ForeignKey(() => User)
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @HasOne(() => MapObjectDetails)
  objectDetails: MapObjectDetails;

  @HasMany(() => MapObjectReview)
  reviews: MapObjectReview;
}

// name        varchar(400) NOT null primary key,
//     phone       varchar(400),
//     address     varchar(400),
//     website   varchar(400),
//     lat        varchar(400),
//     lon         varchar(400),
//     category	varchar(400)
