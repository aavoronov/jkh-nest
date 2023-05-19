import { Module } from '@nestjs/common';
import { ChatRoomsModule } from '../chat-rooms/chat-rooms.module';
import { ChatRoomsService } from '../chat-rooms/chat-rooms.service';
import { ChatModule } from '../chat/chat.module';
import { UtilitiesModule } from '../utilities/utilities.module';
import { UtilitiesService } from '../utilities/utilities.service';
import { TasksService } from './tasks.service';

@Module({
  providers: [
    TasksService,
    UtilitiesService,
    // ChatService,
    // ChatGateway,
    ChatRoomsService,
  ],
  imports: [UtilitiesModule, ChatModule, ChatRoomsModule],
})
export class TasksModule {}
