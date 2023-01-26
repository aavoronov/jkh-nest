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
import { Op, Sequelize } from 'sequelize';
import * as async from 'async';

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
  async getMessages(
    req,
    email: string,
    page: number,
  ): Promise<IRequestMessage> {
    const limit = 20;
    //   const page = parseInt(body.page) || 1;
    const offset = page * limit - limit;

    async function getMessagesPerRoom(room: number) {
      const perRoom = await Message.findAll({
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
        where: { roomId: room },
        attributes: ['id', 'message', 'file', 'roomId', 'createdAt'],
        order: [['id', 'DESC']],
        limit,
        offset,
      });
      return perRoom;
    }

    try {
      const access = await RoomAccess.findAll({
        include: [{ model: User, where: { email: email }, attributes: ['id'] }],
      });

      const rooms = access.map((item) => item.roomId);

      console.log(rooms);

      const results = await async.map(rooms, getMessagesPerRoom);

      const msgs = results.flat().sort((a, b) => {
        const idA = a.id;
        const idB = b.id;
        if (idA < idB) {
          return -1;
        }
        if (idA > idB) {
          return 1;
        }
        return 0;
      });

      return {
        status: StatusCodes.OK,
        message: 'Ok',
        // data: results.map((value) => value.toJSON()),
        data: msgs,
      };
    } catch (e) {
      return { status: StatusCodes.BAD_REQUEST, message: 'Ошибка', data: e };
      // console.log(e);
    }
  }

  async getSearchMessages(
    email: string,
    query: string,
    chat: string,
  ): Promise<IRequestMessage> {
    try {
      const limit = 40;
      //   const page = parseInt(body.page) || 1;
      const page = 1;
      const offset = page * limit - limit;

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
        where: {
          roomId: chat,
          message: {
            // [Sequelize.fn('LOWER', Sequelize.col('someColumn')), 'lower'],
            [Op.iLike]: `%${query}%`,
          },
        },
        attributes: ['id', 'message', 'file', 'roomId', 'createdAt'],
        order: [['id', 'DESC']],
      });

      // const result = messages.map((item) => {
      // if (!!item.file) {
      // item = { ...item, file: this.getFile(item.file) };
      // }
      // });
      console.log(query);

      return {
        status: StatusCodes.OK,
        message: 'Ok',
        data: result.map((value) => value.toJSON()),
      };
    } catch (e) {
      return { status: StatusCodes.BAD_REQUEST, message: 'Ошибка', data: e };
    }
  }

  async getCalendarMessages(
    email: string,
    date: string,
    chat: string,
  ): Promise<IRequestMessage> {
    try {
      const limit = 30;
      //   const page = parseInt(body.page) || 1;
      const page = 1;
      const offset = page * limit - limit;

      const queryDate = new Date(date);
      queryDate.setHours(0, 0, 0, 0);

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
        where: {
          roomId: chat,
          createdAt: { [Op.gte]: queryDate as Date },
        },
        attributes: ['id', 'message', 'file', 'roomId', 'createdAt'],
        order: [['id', 'ASC']],
        limit,
      });

      // const result = messages.map((item) => {
      // if (!!item.file) {
      // item = { ...item, file: this.getFile(item.file) };
      // }
      // });
      // console.log(date);
      // console.log(result);

      return {
        status: StatusCodes.OK,
        message: 'Ok',
        data: result.map((value) => value.toJSON()),
      };
    } catch (e) {
      return { status: StatusCodes.BAD_REQUEST, message: 'Ошибка', data: e };
    }
  }

  async getMessagesNumber(email: string): Promise<IRequestMessage> {
    async function getMessagesPerRoom(room: any) {
      const perRoom = await Message.count({
        where: {
          updatedAt: { [Op.gte]: room.updatedAt as Date },
          roomId: room.roomId,
        },
      });
      return { room: room.roomId, amount: perRoom };
    }

    try {
      const access = await RoomAccess.findAll({
        include: [{ model: User, where: { email: email }, attributes: ['id'] }],
      });

      const rooms = access.map((item) => {
        return { roomId: item.roomId, updatedAt: item.updatedAt };
      });

      console.log(rooms);

      const results = await async.map(rooms, getMessagesPerRoom);

      console.log(results);

      return {
        status: StatusCodes.OK,
        message: 'Ok',
        data: results,
        // data: msgs,
      };
    } catch (e) {
      console.log(e);
      return { status: StatusCodes.BAD_REQUEST, message: 'Ошибка', data: e };
    }
  }

  async getMessagesSince(email: string) {
    console.log('get number');
  }

  // getFile(image: string, res: any): any {
  //   return res.sendFile(image, { root: './uploads' });
  // }

  getFile(image: string, res: any): any {
    return res.sendFile(image, { root: './uploads' });
  }
}
