import {
  Table,
  Column,
  Model,
  DataType,
  HasOne,
  HasMany,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { Verifications } from '../../verifications/entities/verification.entity';
// import { Profile } from './profile.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Message } from '../../chat/entities/message.entity';
import { Profile } from '../../users/entities/profile.entity';
import { RoomAccess } from './room-access.entity';
import { EstateObject } from '../../estate-objects/entities/estate-object.entity';

@Table
export class ChatRoom extends Model<ChatRoom> {
  @ApiProperty()
  @Column({
    type: DataType.STRING,
    unique: true,
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
}
