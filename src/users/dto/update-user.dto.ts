import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty()
  pseudonym: string;

  @ApiProperty()
  oldPassword: string | undefined;

  @ApiProperty()
  newPassword: string | undefined;

  // @ApiProperty()
  // file: string | Blob | undefined;

  // @ApiProperty()
  filename: string | undefined;
}
