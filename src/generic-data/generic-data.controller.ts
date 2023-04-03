import { Controller } from '@nestjs/common';
import { GenericDataService } from './generic-data.service';

@Controller('generic-data')
export class GenericDataController {
  constructor(private readonly genericDataService: GenericDataService) {}
}
