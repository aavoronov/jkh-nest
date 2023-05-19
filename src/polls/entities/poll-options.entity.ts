import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { PollReply } from './poll-reply.entity';
import { Poll } from './poll.entity';

@Table
export class PollOption extends Model<PollOption> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  option: string;

  @BelongsTo(() => Poll)
  poll: Poll;

  @ForeignKey(() => Poll)
  pollId: number;

  @HasMany(() => PollReply)
  reply: PollReply;
}
