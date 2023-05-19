import {
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
import { EstateObject } from '../../estate-objects/entities/estate-object.entity';
import { RoomAccess } from './room-access.entity';

@Table
export class ChatRoom extends Model<ChatRoom> {
  @ApiProperty()
  @Column({
    type: DataType.STRING,
    unique: false,
    allowNull: true,
  })
  address: string;

  //   @BelongsTo(() => RoomAccess)
  //   access: RoomAccess;

  @ForeignKey(() => RoomAccess)
  roomId: number;

  @HasMany(() => Message)
  messages: Message;

  @HasMany(() => EstateObject)
  estateObject: EstateObject;

  @HasMany(() => RoomAccess)
  accesses: RoomAccess;
}
