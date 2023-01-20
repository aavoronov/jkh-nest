import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { ChatRoom } from '../../chat-rooms/entities/chat-room.entity';
import { User } from '../../users/entities/user.entity';

@Table
export class Message extends Model<Message> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  message: string;

  @Column({
    type: DataType.STRING,
  })
  file: string;

  @ForeignKey(() => User)
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => ChatRoom)
  roomId: number;

  @BelongsTo(() => ChatRoom)
  room: ChatRoom;
}
