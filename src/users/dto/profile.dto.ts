import { ApiProperty } from '@nestjs/swagger';

export class ProfileDto {
  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  patronymic: string;

  @ApiProperty()
  pseudonym: string;

  @ApiProperty()
  color: string;

  @ApiProperty()
  sex: string;
}
