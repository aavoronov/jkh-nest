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

@Table
export class Complaint extends Model<Complaint> {
  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => User)
  userId: number;

  //   @BelongsTo(() => USGItem)
  //   USGItem: User;

  //   @ForeignKey(() => User)
  //   USGItemId: number;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  reason: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  text: string;

  @ApiProperty()
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  objectId: number;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: false,
    values: [
      'map object',
      'map review',
      'map reply',
      'trading platform',
      'service',
      'service review',
      'chat message',
      'poll',
    ],
  })
  objectType: string;
}
