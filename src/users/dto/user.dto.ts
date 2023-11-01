import { ApiProperty } from '@nestjs/swagger';

export type Role =
  | 'user'
  | 'uk'
  | 'upravdom'
  | 'admakers'
  | 'stores'
  | 'business'
  | 'admin';

export class UserDto {
  @ApiProperty({ required: true })
  readonly email: string;
  @ApiProperty({ required: true })
  readonly password: string;
  @ApiProperty({ required: true })
  readonly role: Role;
}
