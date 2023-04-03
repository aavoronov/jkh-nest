import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { MapObjectsService } from './map-objects.service';
import { CreateMapObjectDto } from './dto/create-map-object.dto';
import { UpdateMapObjectDto } from './dto/update-map-object.dto';
import { test } from '../utils/import.js';
import { MapObject } from './entities/map-object.entity';
import { ApiTags } from '@nestjs/swagger';
import { StatusCodes } from 'http-status-codes';
import { MapObjectDetails } from './entities/map-object-details.entity';
import { Op } from 'sequelize';
import { CreateReviewDto } from './dto/create-review.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('map-objects')
@Controller('map-objects')
export class MapObjectsController {
  constructor(private readonly mapObjectsService: MapObjectsService) {}

  @Get('/import/:file')
  async import(@Param('file') file: string) {
    const data = test(file);
    data.forEach(async (i) => {
      const object = await MapObject.create({
        point: { type: 'Point', coordinates: [i[6], i[5]] },
        //flipped
        category: i[7],
        isApproved: true,
      });
      await MapObjectDetails.create({
        objectId: object.id,
        name: i[0],
        phoneStationary: i[1],
        phoneMobile: i[2],
        address: i[3],
        website: i[4],
      });
    });
    // (i) => sequelize.query('UPDATE users SET y = 42 WHERE x = 12'),

    // console.log(data);
    await MapObject.destroy({ where: { category: { [Op.is]: null } } });
    return { status: StatusCodes.OK, text: 'success' };
  }

  @Get()
  getObjects() {
    return this.mapObjectsService.getObjects();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.mapObjectsService.getById(+id);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  createObject(
    @Req() req: any,
    @Body() createObjectDto: CreateMapObjectDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return this.mapObjectsService.createObject(req, createObjectDto, files);
  }

  @Post('reviews')
  createReview(@Req() req: any, @Body() createReviewDto: CreateReviewDto) {
    return this.mapObjectsService.createReview(req, createReviewDto);
  }

  @Post('replies')
  createReply(@Req() req: any, @Body() createReplyDto: CreateReplyDto) {
    return this.mapObjectsService.createReply(req, createReplyDto);
  }
}
