import { ApiProperty } from '@nestjs/swagger';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { ServiceReview } from './service-review';
import { ServiceSubcategory } from './service-subcategory.entity';

@Table
export class Service extends Model<Service> {
  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => User)
  userId: number;

  @BelongsTo(() => ServiceSubcategory)
  subcategory: ServiceSubcategory;

  @ForeignKey(() => ServiceSubcategory)
  subcategoryId: number;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  phone: string;

  // @ApiProperty()
  // @Column({
  //   type: DataType.BOOLEAN,
  //   allowNull: true,
  // })
  // hasWhatsapp: boolean;

  // @ApiProperty()
  // @Column({
  //   type: DataType.BOOLEAN,
  //   allowNull: true,
  // })
  // hasTelegram: boolean;

  @ApiProperty()
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isChecked: boolean;

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
  experience: string;

  @ApiProperty()
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  isOrg: boolean;

  @ApiProperty()
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  brigade: boolean;

  @ApiProperty()
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  contract: boolean;

  @ApiProperty()
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  accommodation: boolean;

  @ApiProperty()
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  warranty: boolean;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  workDays: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  workLocation: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  workTime: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  price: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING(1500),
    allowNull: false,
  })
  description: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  mainImage: string;

  @ApiProperty()
  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: false,
  })
  portfolio: string[];

  @ApiProperty()
  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: false,
  })
  passport: string[];

  @HasMany(() => ServiceReview)
  reviews: ServiceReview;
}
