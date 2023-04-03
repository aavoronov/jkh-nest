import { PartialType } from '@nestjs/mapped-types';
import { CreateChatAdDto } from './create-chat-ad.dto';

export class UpdateChatAdDto extends PartialType(CreateChatAdDto) {}
