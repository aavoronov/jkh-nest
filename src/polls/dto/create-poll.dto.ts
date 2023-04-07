import { ApiProperty } from '@nestjs/swagger';

export class CreatePollDto {
  @ApiProperty({ required: true })
  readonly question: string;

  @ApiProperty({ required: true })
  readonly options: string[];

  @ApiProperty({ required: true })
  readonly chats: number[];

  @ApiProperty({ required: true })
  readonly multipleChoice: boolean;
}
