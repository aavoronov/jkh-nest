import { ApiProperty } from '@nestjs/swagger';

export class SignUpToRoomDto {
  @ApiProperty({ required: true })
  readonly email: string;

  @ApiProperty({ required: true })
  readonly chat: string;
}
