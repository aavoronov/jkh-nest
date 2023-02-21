import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { EstateObjectsService } from './estate-objects.service';
import { CreateEstateObjectDto } from './dto/create-estate-object.dto';
import { UpdateEstateObjectDto } from './dto/update-estate-object.dto';

@Controller('estate-objects')
export class EstateObjectsController {
  constructor(private readonly estateObjectsService: EstateObjectsService) {}

  @Post()
  createObject(@Body() createEstateObjectDto: CreateEstateObjectDto) {
    return this.estateObjectsService.createObject(createEstateObjectDto);
  }

  @Get()
  getObjects(@Req() req: any) {
    return this.estateObjectsService.getObjects(req);
  }

  @Delete(':id')
  deleteObject(@Req() req: any, @Param('id') id: string) {
    return this.estateObjectsService.deleteObject(req, +id);
  }

  @Get(':id')
  getObjectById(@Req() req: any, @Param('id') id: string) {
    return this.estateObjectsService.getObjectById(req, +id);
  }

  @Patch('')
  updateObject(
    @Req() req: any,
    @Body() updateEstateObjectDto: UpdateEstateObjectDto,
  ) {
    return this.estateObjectsService.updateObject(req, updateEstateObjectDto);
  }
}
