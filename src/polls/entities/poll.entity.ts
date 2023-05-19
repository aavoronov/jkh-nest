import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { ChatRoom } from '../../chat-rooms/entities/chat-room.entity';
import { User } from '../../users/entities/user.entity';
import { PollOption } from './poll-options.entity';

@Table
export class Poll extends Model<Poll> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  question: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  isMultipleChoice: boolean;

  @HasMany(() => PollOption)
  options: PollOption;

  @BelongsTo(() => User)
  worker: User;

  @ForeignKey(() => User)
  workerId: number;

  @BelongsTo(() => ChatRoom)
  chat: ChatRoom;

  @ForeignKey(() => ChatRoom)
  chatId: number;
}
