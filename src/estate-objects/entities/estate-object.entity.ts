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
import { EstateObjectRights } from './estate-object-rights.entity';

@Table
export class EstateObject extends Model<EstateObject> {
  // @BelongsTo(() => User)
  // user: User;

  // @ForeignKey(() => User)
  // userId: number;

  @BelongsTo(() => ChatRoom)
  chat: ChatRoom;

  @ForeignKey(() => ChatRoom)
  roomId: number;

  @ApiProperty()
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

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  apartment: string;

  @HasMany(() => EstateObjectRights)
  estateObjectRight: EstateObjectRights;

  //   @HasMany(() => Message)
  //   messages: Message;
}
