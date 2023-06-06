import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { NewWorkerObjectApplication } from '../../chat-rooms/entities/worker-object-application.entity';
import { Account } from '../../utilities/entities/account.entity';
import { User } from './user.entity';

@Table
export class WorkerProfile extends Model<WorkerProfile> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  inn: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isResolved: boolean;

  @Column({
    type: DataType.STRING,
  })
  color: string;

  @Column({
    type: DataType.STRING,
  })
  profilePic: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  balance: number;

  // @Column({
  //   type: DataType.STRING,
  //   allowNull: true,
  // })
  // riasToken: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  address: string;

  @Column({
    type: DataType.GEOMETRY('Point'),
    allowNull: false,
  })
  point: any;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => User)
  userId: number;

  @HasMany(() => Account)
  accounts: Account;

  @HasMany(() => NewWorkerObjectApplication)
  objectApplications: NewWorkerObjectApplication;
}
