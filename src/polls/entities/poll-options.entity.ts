import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { Poll } from './poll.entity';
import { PollReply } from './poll-reply.entity';

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
