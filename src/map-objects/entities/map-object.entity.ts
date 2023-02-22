import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
  Model,
} from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';

@Table
export class MapObject extends Model<MapObject> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
  })
  phoneStationaty: string;

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

  @Column({
    type: DataType.STRING,
  })
  latitude: string;

  @Column({
    type: DataType.STRING,
  })
  longitude: string;

  @Column({
    type: DataType.STRING,
  })
  category: string;

  @ForeignKey(() => User)
  userId: number;

  @BelongsTo(() => User)
  user: User;
}

// name        varchar(400) NOT null primary key,
//     phone       varchar(400),
//     address     varchar(400),
//     website   varchar(400),
//     lat        varchar(400),
//     lon         varchar(400),
//     category	varchar(400)
