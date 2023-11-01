import { HttpException, Injectable } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { MessageBody, WebSocketServer } from '@nestjs/websockets/decorators';
import { writeFile } from 'fs';
import { StatusCodes } from 'http-status-codes';
import { Base64 } from 'js-base64';
import { Namespace, Socket } from 'socket.io';
import { ChatRoomsService } from '../chat-rooms/chat-rooms.service';
import { User } from '../users/entities/user.entity';
import { Message } from './entities/message.entity';
import { IMessageBody } from './interfaces/interface';

@WebSocketGateway({ namespace: 'chat' })
@Injectable()
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    // private readonly chatService: ChatService,
    private readonly chatRoomsService: ChatRoomsService,
  ) {}

  @WebSocketServer() io: Namespace;
  // @WebSocketServer() io: Server;

  afterInit() {
    // // console.log('initialized');
    // instrument(this.io, {
    //   auth: false,
    //   mode: 'development',
    // });
  }

  handleConnection(client: Socket): void {
    const sockets = this.io.sockets;
    // // console.log('c');
    // // console.log(sockets.size);
    client.emit('newConnection', 'all except');
  }

  handleDisconnect(): void {
    const sockets = this.io.sockets;
    // // console.log('dc');
    // // console.log(sockets.size);
  }

  @SubscribeMessage('joinRoom')
  handleRoomJoin(client: Socket, room: string[]): void {
    client.join(room);
    // // console.log(client.rooms);
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket, args: any[]): void {
    // // console.log(args);
    const [email, chat] = args;
    // // console.log('ping!', email, chat);
    this.chatRoomsService.createTimeRecord(email, chat);
  }

  @SubscribeMessage('message')
  async handleNewMessage(
    @MessageBody() message: IMessageBody,
    // @MessageBody() file: any,
  ): Promise<void> {
    const user = await User.findOne({
      where: { email: message.email },
      attributes: ['id'],
    });
    // // console.log(user.id);

    let dbFileName = null;

    if (!!message.filename) {
      const fileName = Base64.encodeURI(
        (Math.random() * 1000).toString() + Date.now(),
      );

      dbFileName =
        fileName + message.filename.slice(message.filename.lastIndexOf('.'));
    }

    if (message.file) {
      const myBuffer = Buffer.from(message.file, 'base64');

      writeFile(`./uploads/chat/${dbFileName}`, myBuffer, (err) => {
        // // console.log(err);
      });
    }

    const newMessage = await Message.create({
      userId: user.id,
      message: message.text,
      file: message.filename === '' ? null : dbFileName,
      roomId: parseInt(message.roomId),
    });

    if (!newMessage) {
      throw new HttpException('Ошибка', StatusCodes.BAD_REQUEST, {
        cause: new Error('Some Error'),
      });
    }

    const file = !!message.file ? dbFileName : '';
    // console.log(file);
    const payload = {
      // email: message.email,
      message: message.text,
      name: message.pseudonym,
      time: newMessage.createdAt,
      color: message.color,
      profilePic: message.profilePic,
      file: file,
      roomId: message.roomId,
    };

    // console.log('emits');
    this.io.to(message.roomId).emit('message', payload);
  }
}
