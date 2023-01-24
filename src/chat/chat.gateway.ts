import {
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  SubscribeMessage,
} from '@nestjs/websockets';
import { MessageBody, WebSocketServer } from '@nestjs/websockets/decorators';
import { writeFile } from 'fs';
import { Base64 } from 'js-base64';
import { Namespace, Socket } from 'socket.io';
import { fileURLToPath } from 'url';
import { ChatService } from './chat.service';
import { Message } from './entities/message.entity';
import { IMessageBody } from './interfaces/interface';

@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer() io: Namespace;

  afterInit() {
    console.log('initialized');
  }
  user = '';

  handleConnection(client: Socket): void {
    console.log(client.handshake.query.pseudonym);
    // const url = data.handshake.url;
    this.user = client.handshake.query.pseudonym.toString();
    // client.join('room');
    const sockets = this.io.sockets;
    console.log('c');
    console.log(sockets.size);
    client.emit('newConnection', 'all except');
    this.io
      .to('room1')
      .emit('newConnection', 'nonexistent (yet) room1 on connect');
    this.io.to('room').emit('newConnection', 'room on connect');
    // const rooms = this.io.adapter.rooms;
    // console.log(rooms);
  }

  handleDisconnect(client: Socket): void {
    const sockets = this.io.sockets;
    console.log('dc');
    console.log(sockets.size);
    // client.emit('all except');
    // this.io.emit('all');
  }

  @SubscribeMessage('joinRoom')
  handleRoomJoin(client: Socket, room: string[]) {
    client.join(room);
    console.log(client.rooms);
    // console.log(client.to(room));
    client.emit('joinedRoom', room);
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket): void {
    console.log('ping!');
    this.io.emit('pong', 'pong');
    client.emit('pong');
  }

  @SubscribeMessage('message')
  handleNewMessage(
    @MessageBody() message: IMessageBody,
    // @MessageBody() file: any,
  ): any {
    // @MessageBody() message: IMessageBody
    console.log(message);
    // console.log(file);
    const time = new Date().toString().slice(16, 21);
    console.log(time);
    const payload = {
      // email: message.email,
      message: message.text,
      name: this.user,
      time: time,
      color: message.color,
      file: !!message.file ? message.file : '',
      roomId: message.roomId,
    };

    console.log('emits');
    this.io.to(message.roomId).emit('message', payload);

    // await this.chatService.createMessage({
    //   sender: message.email,
    //   message: message.text,
    // file: fileName
    // });
  }

  // socket.on('room', data => {
  //   console.log('room join');
  //   console.log(data);
  //   socket.join(data.room);
  // });

  // socket.on('leave room', data => {
  //   console.log('leaving room');
  //   console.log(data);
  //   socket.leave(data.room)
  // });

  // socket.on('new message', data => {
  //   console.log(data.room);
  //   socket.broadcast
  //   .to(data.room)
  //   .emit('receive message', data)
  // });
}
