import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ required: true })
  readonly email: string;

  @ApiProperty({ required: false })
  readonly phone: string;

  @ApiProperty({ required: true })
  readonly password: string;

  @ApiProperty({ required: true })
  readonly passwordConfirmation: string;
}
