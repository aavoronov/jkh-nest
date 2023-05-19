import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';

@Table
export class PhoneVerifications extends Model {
  @Column
  otp: string;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => User)
  userId: number;
}
