import { ApiProperty } from '@nestjs/swagger';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { WorkerProfile } from '../../users/entities/worker-profile.entity';

@Table
export class Account extends Model<Account> {
  @BelongsTo(() => WorkerProfile)
  worker: WorkerProfile;

  @ForeignKey(() => WorkerProfile)
  workerId: number;

  @ApiProperty()
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  accountId: number;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  accountNumber: string;
}
