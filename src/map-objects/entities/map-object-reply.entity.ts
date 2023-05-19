import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { MapObjectReview } from './map-object-review.entity';

@Table
export class MapObjectReply extends Model<MapObjectReply> {
  @Column({
    type: DataType.STRING(1500),
  })
  text: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isApproved: boolean;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => User)
  userId: number;

  @BelongsTo(() => MapObjectReview)
  review: MapObjectReview;

  @ForeignKey(() => MapObjectReview)
  reviewId: number;
}

// name        varchar(400) NOT null primary key,
//     phone       varchar(400),
//     address     varchar(400),
//     website   varchar(400),
//     lat        varchar(400),
//     lon         varchar(400),
//     category	varchar(400)
