import { ApiProperty } from '@nestjs/swagger';

export class PayForChatAdDto {
  @ApiProperty({ required: true })
  readonly id: string;

  @ApiProperty({ required: true })
  readonly sum: string;
}
