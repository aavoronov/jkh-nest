import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
  Model,
  HasOne,
  HasMany,
} from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { MapObjectReply } from './map-object-reply.entity';
import { MapObject } from './map-object.entity';

@Table
export class MapObjectReview extends Model<MapObjectReview> {
  @Column({
    type: DataType.INTEGER,
  })
  rating: number;

  @Column({
    type: DataType.STRING,
  })
  text: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isApproved: boolean;

  @BelongsTo(() => MapObject)
  object: MapObject;

  @ForeignKey(() => MapObject)
  objectId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => User)
  userId: number;

  @HasMany(() => MapObjectReply)
  replies: MapObjectReply;
}

// name        varchar(400) NOT null primary key,
//     phone       varchar(400),
//     address     varchar(400),
//     website   varchar(400),
//     lat        varchar(400),
//     lon         varchar(400),
//     category	varchar(400)
