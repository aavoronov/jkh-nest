import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
// import { Profile } from './profile.entity';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { TransactionTypes } from '../dto/create-transaction.dto';

@Table
export class Transaction extends Model<Transaction> {
  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => User)
  userId: number;

  @ApiProperty()
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  sum: number;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: false,
    values: [
      'site-wise ad',
      'chat ad',
      'TP product - top 3d',
      'TP product - top 7d',
      'TP product - vip',
      'TP product - vip + top 3d',
      'TP product - vip + top 7d',
      'service ad',
      'utility',
    ],
  })
  basis: TransactionTypes;

  @ApiProperty()
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  objectId: number;
}
