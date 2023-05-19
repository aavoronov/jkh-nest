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
import { WorkerProfile } from '../../users/entities/worker-profile.entity';

@Table
export class NewWorkerObjectApplication extends Model<NewWorkerObjectApplication> {
  @ApiProperty()
  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: true,
  })
  address: string;

  @Column({
    type: DataType.GEOMETRY('Point'),
    allowNull: false,
  })
  point: any;

  @BelongsTo(() => WorkerProfile)
  worker: WorkerProfile;

  @ForeignKey(() => WorkerProfile)
  workerId: number;
}
