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
import { Message } from '../../chat/entities/message.entity';

import { WorkerProfile } from '../../users/entities/worker-profile.entity';

@Table
export class ChatAd extends Model<ChatAd> {
  //   @ApiProperty()
  //   @Column({
  //     type: DataType.STRING,
  //     unique: false,
  //     allowNull: true,
  //   })
  //   address: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    unique: false,
    allowNull: false,
  })
  image: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    unique: false,
    allowNull: false,
  })
  description: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    unique: false,
    allowNull: false,
  })
  link: string;

  @ApiProperty()
  @Column({
    type: DataType.TIME,
    unique: false,
    allowNull: false,
  })
  time: string;

  @ApiProperty()
  @Column({
    type: DataType.ARRAY(DataType.INTEGER),
    unique: false,
    allowNull: false,
  })
  chats: number[];

  @ApiProperty()
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isApproved: boolean;

  @ApiProperty()
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isPaid: boolean;

  @ApiProperty()
  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  sum: number;

  @BelongsTo(() => WorkerProfile)
  worker: WorkerProfile;

  @ForeignKey(() => WorkerProfile)
  workerId: number;

  @HasMany(() => Message)
  messages: Message;
}
