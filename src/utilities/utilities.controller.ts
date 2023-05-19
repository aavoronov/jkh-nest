import { Controller, Delete, Get, Param } from '@nestjs/common';
import { UtilitiesService } from './utilities.service';

import { ApiTags } from '@nestjs/swagger';

@ApiTags('utilities')
@Controller('utilities')
export class UtilitiesController {
  constructor(private readonly utilitiesService: UtilitiesService) {}

  @Get(':acct')
  getSingleObjectData(@Param('acct') acct: string) {
    return this.utilitiesService.getSingleObjectData(acct);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.utilitiesService.remove(+id);
  }
}
