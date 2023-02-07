import { HttpException } from '@nestjs/common';
import {
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  SubscribeMessage,
} from '@nestjs/websockets';
import { MessageBody, WebSocketServer } from '@nestjs/websockets/decorators';
import { writeFile } from 'fs';
import { StatusCodes } from 'http-status-codes';
import { Base64 } from 'js-base64';
import { Namespace, Socket } from 'socket.io';
import { fileURLToPath } from 'url';
import { ChatRoomsService } from '../chat-rooms/chat-rooms.service';
import { User } from '../users/entities/user.entity';
import { ChatService } from './chat.service';
import { Message } from './entities/message.entity';
import { IMessageBody } from './interfaces/interface';

@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly chatService: ChatService,
    private readonly chatRoomsService: ChatRoomsService,
  ) {}

  @WebSocketServer() io: Namespace;

  afterInit() {
    console.log('initialized');
  }

  handleConnection(client: Socket): void {
    const sockets = this.io.sockets;
    console.log('c');
    console.log(sockets.size);
    client.emit('newConnection', 'all except');
  }

  handleDisconnect(): void {
    const sockets = this.io.sockets;
    console.log('dc');
    console.log(sockets.size);
  }

  @SubscribeMessage('joinRoom')
  handleRoomJoin(client: Socket, room: string[]): void {
    client.join(room);
    console.log(client.rooms);
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket, args: any[]): void {
    console.log(args);
    const [email, chat] = args;
    console.log('ping!', email, chat);
    this.chatRoomsService.createTimeRecord(email, chat);
  }

  @SubscribeMessage('message')
  async handleNewMessage(
    @MessageBody() message: IMessageBody,
    // @MessageBody() file: any,
  ): Promise<void> {
    // @MessageBody() message: IMessageBody
    console.log(message);
    console.log(typeof message.file);

    //! --------------------------------------------- //
    // try {
    console.log(message);
    // const { sender, message, filename, roomId } = message;

    const user = await User.findOne({
      where: { email: message.email },
      attributes: ['id'],
    });
    console.log(user.id);

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

      writeFile(`./uploads/${dbFileName}`, myBuffer, (err) => {
        console.log(err);
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
    console.log('ok');
    // } catch (e) {
    // console.log(e);
    // throw new HttpException(e.message, e.status, {
    //   cause: new Error('Some Error'),
    // });
    // }

    // FileInterceptor('file', {
    //   storage: diskStorage({
    //     destination: './uploads',
    //     filename: (req, file, cb) => {
    //       try {
    //         const fileName = Base64.encodeURI(
    //           (Math.random() * 1000).toString() + Date.now(),
    //         );
    //         console.log(file);
    //         const dbFileName =
    //           fileName +
    //           file.originalname.slice(file.originalname.lastIndexOf('.'));
    //         req.body.filename = dbFileName;
    //         cb(null, `${dbFileName}`);
    //       } catch (e) {
    //         console.log(e);
    //       }
    //     },
    //   }),
    // }),

    //! --------------------------------------------- //

    const time = new Date();
    console.log(time);

    // const file = !!message.file
    //   ? `data:image/${message.filename.slice(
    //       message.filename.lastIndexOf('.') + 1,
    //     )};base64,${message.file.toString('base64')}`
    //   : '';
    const file = !!message.file ? dbFileName : '';
    console.log(file);
    const payload = {
      // email: message.email,
      message: message.text,
      name: message.pseudonym,
      time: newMessage.createdAt,
      color: message.color,
      file: file,
      roomId: message.roomId,
    };

    console.log('emits');
    this.io.to(message.roomId).emit('message', payload);
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
