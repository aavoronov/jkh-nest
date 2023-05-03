import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Req,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import {
  FileFieldsInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { CreateReviewDto } from './dto/create-review.dto';

import { ApiTags } from '@nestjs/swagger';

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get('/categories')
  getCategories() {
    return this.servicesService.getCategories();
  }

  @Post()
  // @UseInterceptors(FilesInterceptor('files'))
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'mainImage', maxCount: 1 },
      { name: 'passport', maxCount: 2 },
      { name: 'portfolio', maxCount: 10 },
    ]),
  )
  createService(
    @UploadedFiles()
    files: {
      mainImage: Array<Express.Multer.File>;
      passport: Array<Express.Multer.File>;
      portfolio: Array<Express.Multer.File>;
    },
    @Body() createServiceDto: CreateServiceDto,
    @Req() req: any,
  ) {
    return this.servicesService.createService(files, createServiceDto, req);
  }

  @Get()
  getServices(
    @Req() req: any,
    @Query('page') page: string,
    @Query('warranty') warranty: string | undefined,
    @Query('contract') contract: string | undefined,
    @Query('isChecked') isChecked: string | undefined,
    @Query('withPortfolio') withPortfolio: string | undefined,
    @Query('privatePerson') privatePerson: string | undefined,
    @Query('organization') organization: string | undefined,
    @Query('withAccommodation') withAccommodation: string | undefined,
    @Query('withoutAccommodation') withoutAccommodation: string | undefined,
    @Query('category') category: string | undefined,
    @Query('searchQuery') searchQuery: string | undefined,
    @Query('radius') radius: number | undefined,
    @Query('longitude') longitude: number | undefined,
    @Query('latitude') latitude: number | undefined,

    // @Query('location') location: string | undefined,
  ) {
    return this.servicesService.getServices(
      req,
      +page,
      warranty,
      contract,
      isChecked,
      withPortfolio,
      privatePerson,
      organization,
      withAccommodation,
      withoutAccommodation,
      category,
      searchQuery,
      radius,
      longitude,
      latitude,
      // location
    );
  }

  @Post('reviews')
  createReview(@Req() req: any, @Body() createReviewDto: CreateReviewDto) {
    return this.servicesService.createReview(req, createReviewDto);
  }

  @Get('my')
  getMyServices(@Req() req: any, @Query('page') page: string) {
    return this.servicesService.getMyServices(req, +page);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.servicesService.getById(+id);
  }

  @Get(':id/reviews')
  getReviews(@Param('id') id: string, @Query('page') page: string) {
    return this.servicesService.getReviews(+id, +page);
  }

  @Delete(':id')
  deleteService(@Req() req: any, @Param('id') id: string) {
    return this.servicesService.deleteService(req, +id);
  }

  // @Get('favorites')
  // getMyFaves(@Req() req: any, @Query('page') page: string) {
  //   return this.tradingPlatformService.getMyFaves(req, +page);
  // }

  // @Get(':id')
  // getProductById(@Req() req: any, @Param('id') id: string) {
  //   return this.tradingPlatformService.getProductById(req, +id);
  // }

  // @Patch(':id')
  // @UseInterceptors(FilesInterceptor('files'))
  // updateProduct(
  //   @UploadedFiles() files: Array<Express.Multer.File>,
  //   @Req() req: any,
  //   @Body() updateTradingPlatformProductDto: UpdateTradingPlatformProductDto,
  //   @Param('id') id: string,
  // ) {
  //   console.log(files);
  //   return this.tradingPlatformService.updateProduct(
  //     files,
  //     req,
  //     updateTradingPlatformProductDto,
  //     +id,
  //   );
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.tradingPlatformService.remove(+id);
  // }
}
