import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { PollsService } from './polls.service';
import { CreatePollDto } from './dto/create-poll.dto';
import { UpdatePollDto } from './dto/update-poll.dto';

import { ApiTags } from '@nestjs/swagger';

@ApiTags('polls')
@Controller('polls')
export class PollsController {
  constructor(private readonly pollsService: PollsService) {}

  @Post()
  createPoll(@Req() req: any, @Body() createPollDto: CreatePollDto) {
    return this.pollsService.createPoll(req, createPollDto);
  }

  @Get('worker/:chat')
  getMyPollsAsWorkerPerChat(@Req() req: any, @Param('chat') chat: number) {
    return this.pollsService.getMyPollsAsWorkerPerChat(req, chat);
  }

  @Get(':chat')
  getMyPollsPerChat(@Req() req: any, @Param('chat') chat: number) {
    return this.pollsService.getMyPollsPerChat(req, chat);
  }

  @Get()
  getMyPollsAsWorker(@Req() req: any) {
    return this.pollsService.getMyPollsAsWorker(req);
  }

  @Post('reply')
  submitReply(@Req() req: any, @Body('optionId') optionId: number[]) {
    return this.pollsService.submitReply(req, optionId);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.pollsService.findOne(+id);
  // }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePollDto: UpdatePollDto) {
    return this.pollsService.update(+id, updatePollDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pollsService.remove(+id);
  }
}
