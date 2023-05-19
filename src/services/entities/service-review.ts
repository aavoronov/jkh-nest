import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { Service } from './service.entity';

@Table
export class ServiceReview extends Model<ServiceReview> {
  @Column({
    type: DataType.INTEGER,
  })
  rating: number;

  @Column({
    type: DataType.STRING(1500),
  })
  text: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isApproved: boolean;

  @BelongsTo(() => Service)
  service: Service;

  @ForeignKey(() => Service)
  serviceId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => User)
  userId: number;
}
