import { HttpException, Injectable } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { Message } from './entities/message.entity';
import {
  IGetMessages,
  IMessage,
  IRequestMessage,
} from './interfaces/interface';
import { StatusCodes } from 'http-status-codes';
import { Profile } from '../users/entities/profile.entity';
import { readFile, writeFile } from 'fs';
import { Express } from 'express';
import { Base64 } from 'js-base64';
import { RoomAccess } from '../chat-rooms/entities/room-access.entity';
import { ChatRoom } from '../chat-rooms/entities/chat-room.entity';

@Injectable()
export class ChatService {
  async createMessage(payload: any): Promise<void> {
    try {
      const { sender, message, filename, roomId } = payload;

      //   const permissions = await ChatPermissions.findAll({
      //     where: { chatId: room, userId: { [Op.ne]: sender } },
      //     attributes: ['userId'],
      //   });

      const user = await User.findOne({
        where: { email: sender },
        attributes: ['id'],
      });
      console.log(user.id);
      const newMessage = await Message.create({
        // chat: room,
        userId: user.id,
        message,
        file: filename,
        roomId: parseInt(roomId),
      });

      //   await ReaderModel.bulkCreate(
      //     permissions.map((value) => ({
      //       userId: value.userId,
      //       messageId: newMessage.id,
      //     })),
      //   );

      if (!newMessage) {
        throw new HttpException('Ошибка', StatusCodes.BAD_REQUEST, {
          cause: new Error('Some Error'),
        });
      }
      console.log('ok');
    } catch (e) {
      throw new HttpException(e.message, e.status, {
        cause: new Error('Some Error'),
      });
    }
  }

  //   async getMessages(body: IGetMessages): Promise<IRequestMessage> {
  async getMessages(req, email: string): Promise<IRequestMessage> {
    try {
      const limit = 40;
      //   const page = parseInt(body.page) || 1;
      const page = 1;
      const offset = page * limit - limit;

      // const includeUser = `exists(SELECT * FROM  "Readers" WHERE "Readers"."userId" = ${body.sender} and "Messages"."id" = "Readers"."messageId")`;
      //   const result1 = await User.findAll({
      //     // where: { id: 1 },
      //     include: [
      //       {
      //         model: Profile,
      //         as: 'profile',
      //         attributes: ['pseudonym', 'color'],
      //       },
      //       {
      //         model: Message,
      //         as: 'messages',
      //         attributes: ['message', 'createdAt'],
      //       },
      //     ],

      //     attributes: ['id'],
      //   });

      const access = await RoomAccess.findAll(
        // { where: { email: email } }
        {
          include: [
            { model: User, where: { email: email }, attributes: ['id'] },
          ],
        },
      );

      const rooms = access.map((item) => item.roomId);

      console.log(rooms);

      const result = await Message.findAll({
        include: [
          {
            model: User,
            attributes: ['id'],
            include: [
              {
                model: Profile,
                as: 'profile',
                attributes: ['pseudonym', 'color'],
              },
            ],
          },
        ],
        where: { roomId: rooms },
        attributes: ['id', 'message', 'file', 'roomId', 'createdAt'],
        order: [['id', 'ASC']],
      });

      // const result = messages.map((item) => {
      // if (!!item.file) {
      // item = { ...item, file: this.getFile(item.file) };
      // }
      // });

      return {
        status: StatusCodes.OK,
        message: 'Ok',
        data: result.map((value) => value.toJSON()),
      };
    } catch (e) {
      return { status: StatusCodes.BAD_REQUEST, message: 'Ошибка', data: e };
    }
  }

  async getSearchMessages(query: string) {
    return 'test';
  }

  // getFile(image: string, res: any): any {
  //   return res.sendFile(image, { root: './uploads' });
  // }
  getFile(image: string, res: any): any {
    return res.sendFile(image, { root: './uploads' });
  }
}
