import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChatRoomsService } from './chat-rooms.service';
import { RegisterWorkerObjectDto } from './dto/register-worker-object.dto';
import { SignUpToRoomDto } from './dto/sign-up-to-room.dto';

@ApiTags('chat-rooms')
@Controller('chat-rooms')
export class ChatRoomsController {
  constructor(private readonly chatRoomsService: ChatRoomsService) {}

  @Get()
  getRooms(@Req() req: any) {
    return this.chatRoomsService.getRooms(req);
  }

  @Get('my')
  getMy(@Req() req: any) {
    return this.chatRoomsService.getMy(req);
  }

  @Post('sign-up')
  signUp(@Body() signUpToRoomDto: SignUpToRoomDto) {
    return this.chatRoomsService.signUp(signUpToRoomDto);
  }

  @Post('worker-object')
  registerWorkerObject(
    @Req() req: any,
    @Body() registerWorkerObjectDto: RegisterWorkerObjectDto,
  ) {
    return this.chatRoomsService.registerWorkerObject(
      req,
      registerWorkerObjectDto,
    );
  }

  @Delete('sign-up')
  leaveChat(@Query('email') email: string, @Query('chat') chat: string) {
    return this.chatRoomsService.leaveChat(email, chat);
  }

  @Get('room/:id/users')
  getUsers(@Param('id') id: number) {
    return this.chatRoomsService.getUsers(id);
  }

  @Get('ad-prices')
  getAdPrices(@Req() req: any) {
    return this.chatRoomsService.getAdPrices(req);
  }
}
