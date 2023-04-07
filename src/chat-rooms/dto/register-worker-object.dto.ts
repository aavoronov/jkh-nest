import { ApiProperty } from '@nestjs/swagger';

export class RegisterWorkerObjectDto {
  @ApiProperty({ required: true })
  readonly address: string;

  @ApiProperty({ required: true })
  readonly latitude: number;

  @ApiProperty({ required: true })
  readonly longitude: number;
}
