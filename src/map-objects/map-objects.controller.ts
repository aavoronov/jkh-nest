import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MapObjectsService } from './map-objects.service';
import { CreateMapObjectDto } from './dto/create-map-object.dto';
import { UpdateMapObjectDto } from './dto/update-map-object.dto';
// import { test } from '../utils/import.js';
import { MapObject } from './entities/map-object.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('map-objects')
@Controller('map-objects')
export class MapObjectsController {
  constructor(private readonly mapObjectsService: MapObjectsService) {}

  // @Get('/test')
  // async import() {
  //   const data = test();
  //   data.forEach((i) =>
  //     MapObject.create({
  //       name: i[0],
  //       phone: i[2],
  //       address: i[2],
  //       website: i[3],
  //       latitude: i[4],
  //       longitude: i[5],
  //       category: i[6],
  //     }),
  //   );
  //   // (i) => sequelize.query('UPDATE users SET y = 42 WHERE x = 12'),

  //   // console.log(data);
  // }

  @Post()
  create(@Body() createMapObjectDto: CreateMapObjectDto) {
    return this.mapObjectsService.create(createMapObjectDto);
  }

  @Get()
  findAll() {
    return this.mapObjectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mapObjectsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMapObjectDto: UpdateMapObjectDto,
  ) {
    return this.mapObjectsService.update(+id, updateMapObjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mapObjectsService.remove(+id);
  }
}
