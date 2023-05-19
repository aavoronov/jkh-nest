import { BelongsTo, ForeignKey, Model, Table } from 'sequelize-typescript';
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
