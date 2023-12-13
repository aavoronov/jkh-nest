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

  @ApiProperty()
  @Column({
    type: DataType.ENUM('user', 'uk', 'upravdom'),
    defaultValue: 'user',
  })
  role: 'user' | 'uk' | 'upravdom';

  @ApiProperty()
  address: string;
}
