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
export class Verifications extends Model {
  @Column
  token: string;
  // @BelongsTo(() => User)
  // id: number;

  @ForeignKey(() => User)
  userId: number;

  @BeforeUpdate
  @BeforeCreate
  static hashToken(instance: Verifications) {
    const salt = bcrypt.genSaltSync();
    instance.token = bcrypt.hashSync(
      JSON.stringify({ date: new Date(), id: instance.id }),
      salt,
    );
  }
}
