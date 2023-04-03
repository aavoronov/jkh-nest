import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
// import { Profile } from './profile.entity';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Complaint } from './complaint.entity';

@Table
export class USGItem extends Model<USGItem> {
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

  @HasMany(() => Complaint)
  complaints: Complaint;
}
