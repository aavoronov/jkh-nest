import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { RoomAccess } from '../../chat-rooms/entities/room-access.entity';
import { User } from './user.entity';

@Table
export class Profile extends Model<Profile> {
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  firstName: string;

  @Column({
    type: DataType.STRING,
    unique: true,
  })
  lastName: string;

  @Column({
    type: DataType.STRING,
  })
  patronymic: string;

  @Column({
    type: DataType.STRING,
  })
  pseudonym: string;

  @Column({
    type: DataType.STRING,
  })
  color: string;

  @Column({
    type: DataType.STRING,
  })
  profilePic: string;

  @Column({
    type: DataType.ENUM,
    values: ['male', 'female'],
  })
  sex: string;

  // @BelongsTo(() => User)
  @ForeignKey(() => User)
  userId: number;

  @ForeignKey(() => RoomAccess)
  roomId: number;
}
