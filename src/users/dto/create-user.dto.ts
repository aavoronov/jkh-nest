import { ApiProperty } from '@nestjs/swagger';

export class CreateUserByEmailDto {
  @ApiProperty({ required: true })
  readonly email: string;

  @ApiProperty({ required: true })
  readonly password: string;

  @ApiProperty({ required: true })
  readonly passwordConfirmation: string;
}

export class CreateUserByPhoneDto {
  @ApiProperty({ required: false })
  readonly phone: string;
}
