import { BelongsTo, ForeignKey, Model, Table } from 'sequelize-typescript';
// import { Profile } from './profile.entity';
import { User } from '../../users/entities/user.entity';
import { ChatRoom } from './chat-room.entity';

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
