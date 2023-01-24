import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChatRoomsService } from './chat-rooms.service';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { SignUpToRoomDto } from './dto/sign-up-to-room.dto';
import { UpdateChatRoomDto } from './dto/update-chat-room.dto';

@ApiTags('chat-rooms')
@Controller('chat-rooms')
export class ChatRoomsController {
  constructor(private readonly chatRoomsService: ChatRoomsService) {}

  @Get()
  getRooms() {
    return this.chatRoomsService.getRooms();
  }

  @Post()
  create(@Body() createChatRoomDto: CreateChatRoomDto) {
    return this.chatRoomsService.create(createChatRoomDto);
  }

  @Get('my/:email')
  getMy(@Param('email') email: string) {
    return this.chatRoomsService.getMy(email);
  }

  @Post('sign-up')
  signUp(@Body() signUpToRoomDto: SignUpToRoomDto) {
    return this.chatRoomsService.signUp(signUpToRoomDto);
  }

  @Delete('sign-up')
  leaveChat(@Query('email') email: string, @Query('chat') chat: string) {
    return this.chatRoomsService.leaveChat(email, chat);
  }

  @Get('room/:id/users')
  getUsers(@Param('id') id: number) {
    return this.chatRoomsService.getUsers(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatRoomsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateChatRoomDto: UpdateChatRoomDto,
  ) {
    return this.chatRoomsService.update(+id, updateChatRoomDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatRoomsService.remove(+id);
  }
}
