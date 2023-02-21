import { ApiProperty } from '@nestjs/swagger';

export class UpdateEmailDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;
}
