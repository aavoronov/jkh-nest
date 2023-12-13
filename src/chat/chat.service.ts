import { HttpException, Injectable } from '@nestjs/common';
import * as async from 'async';
import { StatusCodes } from 'http-status-codes';
import * as jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { ChatAd } from '../chat-ad/entities/chat-ad.entity';
import { RoomAccess } from '../chat-rooms/entities/room-access.entity';
import { Profile } from '../users/entities/profile.entity';
import { User } from '../users/entities/user.entity';
import { WorkerProfile } from '../users/entities/worker-profile.entity';
import { Message } from './entities/message.entity';
import { IRequestMessage } from './interfaces/interface';
import { ChatRoom } from '../chat-rooms/entities/chat-room.entity';
import { EstateObjectRights } from '../estate-objects/entities/estate-object-rights.entity';
import { EstateObject } from '../estate-objects/entities/estate-object.entity';

@Injectable()
export class ChatService {
  async createMessage(payload: any): Promise<void> {
    try {
      // console.log(payload);
      const { sender, message, filename, roomId } = payload;

      //   const permissions = await ChatPermissions.findAll({
      //     where: { chatId: room, userId: { [Op.ne]: sender } },
      //     attributes: ['userId'],
      //   });

      const user = await User.findOne({
        where: { email: sender },
        attributes: ['id'],
      });
      // console.log(user.id);
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
      // console.log('ok');
    } catch (e) {
      // console.log(e);
      throw new HttpException(e.message, e.status, {
        cause: new Error('Some Error'),
      });
    }
  }

  //   async getMessages(body: IGetMessages): Promise<IRequestMessage> {
  async getMessages(req: any): Promise<IRequestMessage> {
    const limit = 20;
    const page = 1;
    const offset = page * limit - limit;

    const token = req.headers.authorization;
    const result = jwt.verify(token, process.env.JWT);

    const user = await User.findOne({ where: { email: result.email } });

    async function getMessagesPerRoom(room: number) {
      const perRoom = await Message.findAll({
        include: [
          {
            model: User,
            attributes: ['id', 'role'],
            include: [
              {
                model: Profile,
                as: 'profile',
                attributes: ['pseudonym', 'color', 'profilePic'],
              },
              {
                model: WorkerProfile,
                as: 'workerProfile',
                attributes: ['name', 'color', 'profilePic'],
              },
            ],
          },
          {
            model: ChatAd,
            attributes: ['link'],
          },
        ],
        where: { roomId: room },
        attributes: ['id', 'message', 'role', 'file', 'roomId', 'createdAt'],
        order: [['id', 'DESC']],
        limit,
        // offset,
      });
      return perRoom;
    }

    try {
      const chats = await RoomAccess.findAll({
        include: [
          {
            model: User,
            where: { email: result.email },
            attributes: ['id'],
          },
          {
            model: ChatRoom,
            as: 'chat',
            required: true,
            include: [
              {
                model: EstateObject,
                required: true,
                attributes: [],
                include: [
                  {
                    model: EstateObjectRights,
                    attributes: [],
                    where: { role: result.role, userId: user.id },
                    required: true,
                  },
                ],
              },
            ],
          },
        ],
      });

      const rooms = chats.map((item) => item.roomId);

      // console.log(rooms);

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
      console.log(e);
      return { status: StatusCodes.BAD_REQUEST, message: 'Ошибка', data: e };
    }
  }

  async getMoreMessages(
    req: any,
    page: number,
    chat: string,
  ): Promise<IRequestMessage> {
    const limit = 20;
    //   const page = parseInt(body.page) || 1;
    const offset = page * limit - limit;

    const token = req.headers.authorization;
    const result = jwt.verify(token, process.env.JWT);

    async function getMessagesPerRoom(room: number) {
      const perRoom = await Message.findAll({
        include: [
          {
            model: User,
            attributes: ['id', 'role'],
            include: [
              {
                model: Profile,
                as: 'profile',
                attributes: ['pseudonym', 'color', 'profilePic'],
              },
              {
                model: WorkerProfile,
                as: 'workerProfile',
                attributes: ['name', 'color', 'profilePic'],
              },
            ],
          },
          {
            model: ChatAd,
            attributes: ['link'],
          },
        ],
        where: { roomId: room },
        attributes: ['id', 'message', 'role', 'file', 'roomId', 'createdAt'],
        order: [['id', 'DESC']],
        limit,
        offset,
      });
      return perRoom;
    }

    try {
      const access = await RoomAccess.findAll({
        include: [
          { model: User, where: { email: result.email }, attributes: ['id'] },
        ],
      });

      const rooms = access.map((item) => item.roomId);

      // console.log(rooms);

      if (!rooms.includes(parseInt(chat))) {
        throw new HttpException(
          'Вы не зарегистрированы в этом чате',
          StatusCodes.FORBIDDEN,
          {
            cause: new Error('Some Error'),
          },
        );
      }

      const results = await getMessagesPerRoom(parseInt(chat));

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
      // // console.log(e);
    }
  }

  async getSearchMessages(
    req: any,
    query: string,
    chat: string,
  ): Promise<IRequestMessage> {
    try {
      const limit = 40;
      //   const page = parseInt(body.page) || 1;
      const page = 1;
      const offset = page * limit - limit;

      // const token = req.headers.authorization;
      // const result = jwt.verify(token, process.env.JWT);
      // const user = await User.findOne({
      //   where: { email: result.email },
      //   include: [{ model: WorkerProfile }],
      // });

      const result = await Message.findAll({
        include: [
          {
            model: User,
            attributes: ['id', 'role'],
            include: [
              {
                model: Profile,
                as: 'profile',
                attributes: ['pseudonym', 'color', 'profilePic'],
              },
              {
                model: WorkerProfile,
                as: 'workerProfile',
                attributes: ['name', 'color', 'profilePic'],
              },
            ],
          },
        ],
        where: {
          roomId: chat,
          message: {
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
      // console.log(query);

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
    req: any,
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
            attributes: ['id', 'role'],
            include: [
              {
                model: Profile,
                as: 'profile',
                attributes: ['pseudonym', 'color', 'profilePic'],
              },
              {
                model: WorkerProfile,
                as: 'workerProfile',
                attributes: ['name', 'color', 'profilePic'],
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
      // // console.log(date);
      // // console.log(result);

      return {
        status: StatusCodes.OK,
        message: 'Ok',
        data: result.map((value) => value.toJSON()),
      };
    } catch (e) {
      return { status: StatusCodes.BAD_REQUEST, message: 'Ошибка', data: e };
    }
  }

  async getMessagesNumber(req: any): Promise<IRequestMessage> {
    async function getMessagesPerRoom(room: any) {
      const perRoom = await Message.count({
        where: {
          updatedAt: { [Op.gte]: room.updatedAt as Date },
          roomId: room.roomId,
        },
      });
      return { room: room.roomId, amount: perRoom };
    }

    const token = req.headers.authorization;
    const result = jwt.verify(token, process.env.JWT);

    const user = await User.findOne({ where: { email: result.email } });

    try {
      const chats = await RoomAccess.findAll({
        include: [
          {
            model: User,
            where: { email: result.email },
            attributes: ['id'],
          },
          {
            model: ChatRoom,
            as: 'chat',
            required: true,
            include: [
              {
                model: EstateObject,
                required: true,
                attributes: [],
                include: [
                  {
                    model: EstateObjectRights,
                    attributes: [],
                    where: { role: result.role, userId: user.id },
                    required: true,
                  },
                ],
              },
            ],
          },
        ],
      });

      const rooms = chats.map((item) => {
        return { roomId: item.roomId, updatedAt: item.updatedAt };
      });

      // console.log(rooms);

      const results = await async.map(rooms, getMessagesPerRoom);

      // console.log(results);

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

  getFile(image: string, res: any): any {
    return res.sendFile(image, { root: './uploads' });
  }
}
