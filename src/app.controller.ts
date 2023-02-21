import { Controller, Get, Param, Res } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('uploads/:path/:name')
  seeUploadedFile(
    @Param('path') path: string,
    @Param('name') image: string,
    @Res() res: any,
  ) {
    return this.appService.getFile(path, image, res);
  }
}
