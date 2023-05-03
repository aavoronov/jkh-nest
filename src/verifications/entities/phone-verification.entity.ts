import {
  Model,
  Table,
  ForeignKey,
  Column,
  BeforeUpdate,
  BeforeCreate,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Table
export class PhoneVerifications extends Model {
  @Column
  otp: string;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => User)
  userId: number;
}
