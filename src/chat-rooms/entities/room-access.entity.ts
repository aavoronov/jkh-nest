import {
  Table,
  Column,
  Model,
  DataType,
  HasOne,
  HasMany,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
// import { Profile } from './profile.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Message } from '../../chat/entities/message.entity';
import { Profile } from '../../users/entities/profile.entity';
import { ChatRoom } from './chat-room.entity';
import { User } from '../../users/entities/user.entity';

@Table
export class RoomAccess extends Model<RoomAccess> {
  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => User)
  userId: number;

  @BelongsTo(() => ChatRoom)
  chat: ChatRoom;

  @ForeignKey(() => ChatRoom)
  roomId: number;

  //   @HasMany(() => Message)
  //   messages: Message;
}
