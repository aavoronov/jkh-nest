import { Controller, Get, Req, Res, Body } from '@nestjs/common';
import {
  Delete,
  Header,
  Param,
  Post,
  Query,
  Response,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { Message } from './entities/message.entity';
import {
  IGetMessages,
  IMessage,
  IRequestMessage,
} from './interfaces/interface';
import { Express } from 'express';
import { diskStorage } from 'multer';
import { Base64 } from 'js-base64';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':email')
  getMessages(@Req() req, @Param('email') email: string) {
    return this.chatService.getMessages(req, email);
  }

  @Get('more/:email')
  getMoreMessages(
    @Req() req,
    @Param('email') email: string,
    @Query('page') page: number,
    @Query('chat') chat: string,
  ) {
    return this.chatService.getMoreMessages(req, email, page, chat);
  }

  // @Post()
  // @UseInterceptors(FileInterceptor('file'))
  // createMessage(
  //   @UploadedFile() file: Express.Multer.File | undefined,
  //   @Body() payload: any,
  // ) {
  //   return this.chatService.createMessage(payload, file);
  // }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
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
  createMessage(@Body() payload: any) {
    console.log(payload._parts);
    return this.chatService.createMessage(payload);
  }

  @Get('search/:email')
  getSearchMessages(
    @Param('email') email: string,
    @Query('query') query: string,
    @Query('chat') chat: string,
  ) {
    console.log(query);
    return this.chatService.getSearchMessages(email, query, chat);
  }

  @Get('calendar/:email')
  getCalendarMessages(
    @Param('email') email: string,
    @Query('date') date: string,
    @Query('chat') chat: string,
  ) {
    console.log(date);
    return this.chatService.getCalendarMessages(email, date, chat);
  }

  // @Post('uploads')
  // @UseInterceptors(FileInterceptor('file'))
  // uploadFile(@UploadedFile() file: Express.Multer.File) {
  //   return this.chatService.uploadFile(file);
  // }

  @Get('notifications/:email')
  getMessagesNumber(@Param('email') email: string) {
    return this.chatService.getMessagesNumber(email);
  }

  @Get('since/:email')
  getMessagesSince(@Param('email') email: string) {
    return this.chatService.getMessagesSince(email);
  }

  @Get('uploads/:name')
  seeUploadedFile(@Param('name') image: string, @Res() res: any) {
    return this.chatService.getFile(image, res);
  }

  // @Get(':imgpath')
  // seeUploadedFile(@Param('imgpath') image, @Res() res) {
  //   return res.sendFile(image, { root: './files' });
  // }
}
