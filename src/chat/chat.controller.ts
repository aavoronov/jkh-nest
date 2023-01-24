import { Controller, Get, Req, Res, Body } from '@nestjs/common';
import {
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
          const fileName = Base64.encodeURI(
            (Math.random() * 1000).toString() + Date.now(),
          );
          console.log(file.originalname);
          const dbFileName = fileName + '.' + file.originalname.split('.')[1];
          req.body.filename = dbFileName;
          cb(null, `${dbFileName}`);
        },
      }),
    }),
  )
  createMessage(@Body() payload: any) {
    return this.chatService.createMessage(payload);
  }

  @Get('search/:email')
  getSearchMessages(
    @Param('email') email: string,
    @Query('query') query: string,
  ) {
    console.log(query);
    return this.chatService.getSearchMessages(email, query);
  }

  // @Post('uploads')
  // @UseInterceptors(FileInterceptor('file'))
  // uploadFile(@UploadedFile() file: Express.Multer.File) {
  //   return this.chatService.uploadFile(file);
  // }

  @Get('uploads/:name')
  seeUploadedFile(@Param('name') image: string, @Res() res: any) {
    return this.chatService.getFile(image, res);
  }

  // @Get(':imgpath')
  // seeUploadedFile(@Param('imgpath') image, @Res() res) {
  //   return res.sendFile(image, { root: './files' });
  // }
}
