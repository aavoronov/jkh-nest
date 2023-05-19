import { Body, Controller, Get, Req } from '@nestjs/common';
import { Post, Query, UseInterceptors } from '@nestjs/common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Base64 } from 'js-base64';
import { diskStorage } from 'multer';
import { ChatService } from './chat.service';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  getMessages(@Req() req) {
    // // console.log('fired');
    return this.chatService.getMessages(req);
  }

  @Get('more')
  getMoreMessages(
    @Req() req: any,
    @Query('page') page: number,
    @Query('chat') chat: string,
  ) {
    return this.chatService.getMoreMessages(req, page, chat);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/chat/',
        filename: (req, file, cb) => {
          try {
            const fileName = Base64.encodeURI(
              (Math.random() * 1000).toString() + Date.now(),
            );
            const dbFileName =
              fileName +
              file.originalname.slice(file.originalname.lastIndexOf('.'));
            req.body.filename = dbFileName;
            cb(null, `${dbFileName}`);
          } catch (e) {
            // console.log(e);
          }
        },
      }),
    }),
  )
  createMessage(@Body() payload: any) {
    return this.chatService.createMessage(payload);
  }

  @Get('search')
  getSearchMessages(
    @Req() req: any,
    @Query('query') query: string,
    @Query('chat') chat: string,
  ) {
    return this.chatService.getSearchMessages(req, query, chat);
  }

  @Get('calendar')
  getCalendarMessages(
    @Req() req: any,
    @Query('date') date: string,
    @Query('chat') chat: string,
  ) {
    return this.chatService.getCalendarMessages(req, date, chat);
  }

  // @Post('uploads')
  // @UseInterceptors(FileInterceptor('file'))
  // uploadFile(@UploadedFile() file: Express.Multer.File) {
  //   return this.chatService.uploadFile(file);
  // }

  @Get('notifications')
  getMessagesNumber(@Req() req: any) {
    return this.chatService.getMessagesNumber(req);
  }

  // @Get('uploads/:name')
  // seeUploadedFile(@Param('name') image: string, @Res() res: any) {
  //   return this.chatService.getFile(image, res);
  // }

  // @Get(':imgpath')
  // seeUploadedFile(@Param('imgpath') image, @Res() res) {
  //   return res.sendFile(image, { root: './files' });
  // }
}
