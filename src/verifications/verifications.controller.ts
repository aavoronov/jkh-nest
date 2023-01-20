import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller('verifications')
@ApiTags('verifications')
export class VerificationsController {}
