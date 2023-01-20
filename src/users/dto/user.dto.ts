import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ required: true })
  readonly email: string;
  @ApiProperty({ required: true })
  readonly password: string;
}
