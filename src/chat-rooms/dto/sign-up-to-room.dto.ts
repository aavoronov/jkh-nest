import { ApiProperty } from '@nestjs/swagger';
import { CreateChatRoomDto } from './create-chat-room.dto';

export class SignUpToRoomDto {
  @ApiProperty({ required: true })
  readonly email: string;

  @ApiProperty({ required: true })
  readonly chat: string;
}
