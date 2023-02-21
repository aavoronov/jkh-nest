import { ApiProperty } from '@nestjs/swagger';

export class CreateTradingPlatformProductDto {
  name: string;
  subcategory: string;
  condition: string;
  wts: boolean;
  description: string;
  location: string;
  price: string;
  phone: string;
  hasWhatsapp: boolean;
  hasTelegram: boolean;
  promoPrimary: number;
  isVip: boolean;
  email: string;
}
