import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkerProfileDto {
  @ApiProperty({ required: true })
  readonly name: string;

  @ApiProperty({ required: true })
  readonly email: string;

  @ApiProperty({ required: true })
  readonly phone: string;

  @ApiProperty({ required: true })
  readonly type: string;

  // @ApiProperty({ required: false })
  // readonly riasToken: string;

  @ApiProperty({ required: true })
  readonly latitude: string;

  @ApiProperty({ required: true })
  readonly longitude: string;

  @ApiProperty({ required: true })
  readonly address: string;
}
