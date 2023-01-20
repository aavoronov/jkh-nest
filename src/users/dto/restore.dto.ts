import { ApiProperty } from '@nestjs/swagger';

export class RestorePasswordDto {
  @ApiProperty()
  email: string;
}
