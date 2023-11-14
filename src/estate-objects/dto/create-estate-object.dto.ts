import { ApiProperty } from '@nestjs/swagger';

export class CreateEstateObjectDto {
  @ApiProperty({ required: true })
  readonly email: string;

  @ApiProperty({ required: true })
  readonly address: string;

  @ApiProperty({ required: false })
  readonly latitude: string;

  @ApiProperty({ required: false })
  readonly longitude: string;

  @ApiProperty({ required: true })
  readonly apartment: string;

  @ApiProperty({ required: true })
  readonly account: string;

  @ApiProperty({ required: true })
  readonly isOwner: boolean;

  @ApiProperty({ required: true })
  readonly role: 'user' | 'uk' | 'upravdom';
}
