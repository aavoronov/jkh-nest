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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Base64 } from 'js-base64';
import { diskStorage } from 'multer';
import { ChatAdService } from './chat-ad.service';
import { CreateChatAdDto } from './dto/create-chat-ad.dto';
import { UpdateChatAdDto } from './dto/update-chat-ad.dto';
import { PayForChatAdDto } from './dto/pay-for-chat-ad-dto';

@Controller('chat-ads')
export class ChatAdController {
  constructor(private readonly chatAdService: ChatAdService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/chat/',
        filename: (req, file, cb) => {
          try {
            const fileName = Base64.encodeURI(
              (Math.random() * 1000).toString() + Date.now(),
            );
            console.log(file);
            const dbFileName =
              fileName +
              file.originalname.slice(file.originalname.lastIndexOf('.'));
            req.body.filename = dbFileName;
            cb(null, `${dbFileName}`);
          } catch (e) {
            console.log(e);
          }
        },
      }),
    }),
  )
  @Post()
  createChatAd(@Req() req: any, @Body() createChatAdDto: CreateChatAdDto) {
    return this.chatAdService.createChatAd(req, createChatAdDto);
  }

  @Get()
  getMyChatAds(@Req() req: any) {
    return this.chatAdService.getMyChatAds(req);
  }

  @Post('pay')
  payForChatAd(@Req() req: any, @Body() payForChatAdDto: PayForChatAdDto) {
    return this.chatAdService.payForChatAd(req, payForChatAdDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatAdService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChatAdDto: UpdateChatAdDto) {
    return this.chatAdService.update(+id, updateChatAdDto);
  }

  @Delete(':id')
  deleteChatAd(@Req() req: any, @Param('id') id: string) {
    return this.chatAdService.deleteChatAd(req, +id);
  }
}
