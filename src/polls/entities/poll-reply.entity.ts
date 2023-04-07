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
import { User } from '../../users/entities/user.entity';
import { PollOption } from './poll-options.entity';

@Table
export class PollReply extends Model<PollReply> {
  @BelongsTo(() => PollOption)
  option: PollOption;

  @ForeignKey(() => PollOption)
  pollOptionId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => User)
  userId: number;
}
