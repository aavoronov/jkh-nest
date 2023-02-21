import { PartialType } from '@nestjs/mapped-types';
import { CreateTradingPlatformProductDto } from './create-trading-platform-product.dto';

export class UpdateTradingPlatformProductDto extends PartialType(
  CreateTradingPlatformProductDto,
) {}
