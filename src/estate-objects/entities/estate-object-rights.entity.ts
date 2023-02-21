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
// import { Profile } from './profile.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Message } from '../../chat/entities/message.entity';
import { Profile } from '../../users/entities/profile.entity';
import { ChatRoom } from '../../chat-rooms/entities/chat-room.entity';
import { User } from '../../users/entities/user.entity';
import { EstateObject } from './estate-object.entity';

@Table
export class EstateObjectRights extends Model<EstateObjectRights> {
  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => User)
  userId: number;

  @BelongsTo(() => EstateObject)
  estateObject: EstateObject;

  @ForeignKey(() => EstateObject)
  estateObjectId: number;

  @ApiProperty()
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  isOwnerRatherThanTenant: boolean;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  account: string;

  // @BelongsTo(() => ChatRoom)
  // chat: ChatRoom;

  // @ForeignKey(() => ChatRoom)
  // roomId: number;

  @ApiProperty()
  address: string;

  //   @HasMany(() => Message)
  //   messages: Message;
}
