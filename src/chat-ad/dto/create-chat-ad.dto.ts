import { ApiProperty } from '@nestjs/swagger';

export class CreateChatAdDto {
  @ApiProperty({ required: true })
  readonly description: string;

  @ApiProperty({ required: true })
  readonly link: string;

  @ApiProperty({ required: true })
  readonly hours: string;

  @ApiProperty({ required: true })
  readonly minutes: string;

  @ApiProperty({ required: true })
  readonly radius: string;

  @ApiProperty({ required: true })
  readonly chats: string;

  @ApiProperty({ required: true })
  readonly price: string;

  filename: string | undefined;
}
