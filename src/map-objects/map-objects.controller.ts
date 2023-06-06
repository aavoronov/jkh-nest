import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { StatusCodes } from 'http-status-codes';
import { Op } from 'sequelize';
import { test } from '../utils/import.js';
import { CreateMapObjectDto } from './dto/create-map-object.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { MapObjectDetails } from './entities/map-object-details.entity';
import { MapObject } from './entities/map-object.entity';
import { MapObjectsService } from './map-objects.service';

@ApiTags('map-objects')
@Controller('map-objects')
export class MapObjectsController {
  constructor(private readonly mapObjectsService: MapObjectsService) {}

  // files: [
  //   'bank',
  //   'bathroom',
  //   'beauty',
  //   'cafe',
  //   'church',
  //   'education',
  //   'gas',
  //   'museum',
  //   'shops',
  // ];

  // @Get('/import/:file')
  // async import(@Param('file') file: string) {
  //   const data = test(file);

  //   const createEntriesForOneObject = async (i) => {
  //     try {
  //       const object = await MapObject.create({
  //         point: { type: 'Point', coordinates: [i[6], i[5]] },
  //         //flipped
  //         category: i[7],
  //         isApproved: true,
  //       });
  //       await MapObjectDetails.create({
  //         objectId: object.id,
  //         name: i[0],
  //         phoneStationary: i[1],
  //         phoneMobile: i[2],
  //         address: i[3],
  //         website: i[4],
  //       });
  //       return true;
  //     } catch (e) {
  //       console.log('e', e.message);
  //     }
  //   };

  //   const done = Promise.all(data.map(createEntriesForOneObject))
  //     .then(() => {
  //       MapObject.destroy({ where: { category: { [Op.is]: null } } });
  //     })
  //     .then(() =>
  //       MapObjectDetails.destroy({
  //         where: { objectId: { [Op.is]: null } },
  //       }),
  //     )
  //     .then(() => {
  //       console.log('ok');
  //     })
  //     .catch(() => {
  //       return { status: StatusCodes.INTERNAL_SERVER_ERROR, text: 'error' };
  //     });

  //   // if (await done) {
  //   //   return { status: StatusCodes.OK, text: 'success' };
  //   // }

  //   return { status: StatusCodes.OK, text: 'success' };

  //   // data.forEach(async (i) => {
  //   //   const object = await MapObject.create({
  //   //     point: { type: 'Point', coordinates: [i[6], i[5]] },
  //   //     //flipped
  //   //     category: i[7],
  //   //     isApproved: true,
  //   //   });
  //   //   await MapObjectDetails.create({
  //   //     objectId: object.id,
  //   //     name: i[0],
  //   //     phoneStationary: i[1],
  //   //     phoneMobile: i[2],
  //   //     address: i[3],
  //   //     website: i[4],
  //   //   });
  //   // });
  //   // (i) => sequelize.query('UPDATE users SET y = 42 WHERE x = 12'),

  //   // // console.log(data);
  // }

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

    // // console.log(data);
    await MapObject.destroy({ where: { category: { [Op.is]: null } } });
    return { status: StatusCodes.OK, text: 'success' };
  }

  @Get()
  getObjects() {
    return this.mapObjectsService.getObjects();
  }

  @Get('bounds')
  getObjectsInBounds(
    @Query('lon0') lon0: string,
    @Query('lat0') lat0: string,
    @Query('lon1') lon1: string,
    @Query('lat1') lat1: string,
  ) {
    return this.mapObjectsService.getObjectsInBounds(lon0, lat0, lon1, lat1);
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
