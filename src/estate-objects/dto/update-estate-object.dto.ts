import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { CreateEstateObjectDto } from './create-estate-object.dto';

export class UpdateEstateObjectDto extends CreateEstateObjectDto {
  @ApiProperty({ required: true })
  readonly id: string;
}
