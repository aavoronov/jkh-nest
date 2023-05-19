import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateTradingPlatformProductDto } from './dto/create-trading-platform-product.dto';
import { UpdateTradingPlatformProductDto } from './dto/update-trading-platform-product.dto';
import { TradingPlatformService } from './trading-platform.service';

import { ApiTags } from '@nestjs/swagger';

@ApiTags('trading-platform')
@Controller('trading-platform')
export class TradingPlatformController {
  constructor(
    private readonly tradingPlatformService: TradingPlatformService,
  ) {}

  @Get('/categories')
  getCategories() {
    return this.tradingPlatformService.getCategories();
  }

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  createProduct(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() req: any,
    @Body() createTradingPlatformProductDto: CreateTradingPlatformProductDto,
  ) {
    return this.tradingPlatformService.createProduct(
      files,
      req,
      createTradingPlatformProductDto,
    );
  }

  @Get()
  getProducts(
    @Req() req: any,
    @Query('page') page: string,
    @Query('subcategoryId') subcategoryId: string | undefined,
    @Query('condition') condition: string | undefined,
    @Query('pmin') pmin: string | undefined,
    @Query('pmax') pmax: string | undefined,
    @Query('wimgsonly') wimgsonly: string | undefined,
    @Query('category') category: string | undefined,
    @Query('wts') wts: string | undefined,
    @Query('searchQuery') searchQuery: string | undefined,
    @Query('location') location: string | undefined,
  ) {
    return this.tradingPlatformService.getProducts(
      req,
      +page,
      subcategoryId,
      condition,
      pmin,
      pmax,
      wimgsonly,
      category,
      wts,
      searchQuery,
      location,
    );
  }

  @Get('my')
  getMyProducts(@Req() req: any, @Query('page') page: string) {
    return this.tradingPlatformService.getMyProducts(req, +page);
  }

  @Get('favorites/:id')
  toggleFavorites(@Req() req: any, @Param('id') id: string) {
    return this.tradingPlatformService.toggleFavorites(req, +id);
  }

  @Delete(':id')
  deleteProduct(@Req() req: any, @Param('id') id: string) {
    return this.tradingPlatformService.deleteProduct(req, +id);
  }

  @Get('favorites')
  getMyFaves(@Req() req: any, @Query('page') page: string) {
    return this.tradingPlatformService.getMyFaves(req, +page);
  }

  @Get(':id')
  getProductById(@Req() req: any, @Param('id') id: string) {
    return this.tradingPlatformService.getProductById(req, +id);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files'))
  updateProduct(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() req: any,
    @Body() updateTradingPlatformProductDto: UpdateTradingPlatformProductDto,
    @Param('id') id: string,
  ) {
    // console.log(files);
    return this.tradingPlatformService.updateProduct(
      files,
      req,
      updateTradingPlatformProductDto,
      +id,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tradingPlatformService.remove(+id);
  }
}
