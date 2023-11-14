import { HttpException, Injectable } from '@nestjs/common';
import { StatusCodes } from 'http-status-codes';
import * as jwt from 'jsonwebtoken';
import { Op, Sequelize } from 'sequelize';
import { ChatRoom } from '../chat-rooms/entities/chat-room.entity';
import { RoomAccess } from '../chat-rooms/entities/room-access.entity';
import { NewWorkerObjectApplication } from '../chat-rooms/entities/worker-object-application.entity';
import { Message } from '../chat/entities/message.entity';
import { User } from '../users/entities/user.entity';
import { WorkerProfile } from '../users/entities/worker-profile.entity';
import { CreateEstateObjectDto } from './dto/create-estate-object.dto';
import { UpdateEstateObjectDto } from './dto/update-estate-object.dto';
import { EstateObjectRights } from './entities/estate-object-rights.entity';
import { EstateObject } from './entities/estate-object.entity';

@Injectable()
export class EstateObjectsService {
  private async deleteUnauthorizedChatsAccess(userId) {
    const chatRooms = await ChatRoom.findAll({
      // where: {
      //   '$EstateObject.EstateObjectRight.userId$': { [Op.eq]: user.id },
      // },
      include: [
        {
          model: EstateObject,
          required: true,
          attributes: ['id'],
          include: [
            {
              model: EstateObjectRights,
              where: { userId: userId },
              required: true,
              attributes: ['id'],
            },
          ],
        },
      ],
    });
    const roomsAvailable = chatRooms.map((item) => item.id);

    // const rooms = await ChatRoom.findAll({ where: { id: roomsAvailable } });

    const chats = await RoomAccess.findAll({
      where: { userId: userId },
      include: [{ model: ChatRoom, as: 'chat' }],
      attributes: ['id'],
    });
    // return chats;

    const myChats = chats.map((item) => item.chat.id);
    // const roomsIds = rooms.map(item => item.id)
    // // console.log(roomsAvailable);
    // // console.log(myChats);
    const chatsToDelete = myChats.filter(
      (item) => !roomsAvailable.includes(item),
    );

    // console.log(chatsToDelete);

    if (!!chatsToDelete.length) {
      const room = await RoomAccess.destroy({
        where: {
          userId: userId,
          roomId: chatsToDelete[0],
        },
      });

      // console.log(room);
    }
  }

  async createObject(createEstateObjectDto: CreateEstateObjectDto) {
    // console.log(createEstateObjectDto);
    const {
      email,
      address,
      latitude,
      longitude,
      apartment,
      account,
      isOwner,
      role,
    } = createEstateObjectDto;

    const user = await User.findOne({ where: { email: email } });

    const shortAddress =
      address.split(', ').at(-2) + ', ' + address.split(', ').at(-1);
    // console.log(shortAddress);

    const [chatRoom, created] = await ChatRoom.findOrCreate({
      where: { address: shortAddress },
    });

    if (!created) {
      // console.log('room exists');
    }

    // console.log(!!chatRoom);

    let object = await EstateObject.findOne({
      where: {
        address: address,
        apartment: apartment,
        // point: { type: 'Point', coordinates: [+latitude, +longitude] },
        // latitude: latitude,
        // longitude: longitude,
      },
    });

    if (!!object) {
      // console.log('object exists');
    } else {
      object = await EstateObject.create({
        address: address,
        apartment: apartment,
        // account: account,
        roomId: chatRoom.id,
        point: { type: 'Point', coordinates: [longitude, latitude] },
        //flipped
      });
    }

    // // console.log(object);

    if (!object) {
      throw new HttpException('Что-то пошло не так', StatusCodes.BAD_REQUEST, {
        cause: new Error('Some Error'),
      });
    }

    let objectRight = await EstateObjectRights.findOne({
      where: {
        // // isOwnerRatherThanTenant: isOwner,
        // // account: account,
        // role: role,
        estateObjectId: object.id,
        userId: user.id,
      },
    });

    if (!!objectRight) {
      throw new HttpException(
        'Вы уже зарегистрировали этот объект',
        StatusCodes.CONFLICT,
        {
          cause: new Error('Some Error'),
        },
      );
    }

    objectRight = await EstateObjectRights.create({
      isOwnerRatherThanTenant: isOwner,
      // role: role,
      account: account,
      estateObjectId: object.id,
      userId: user.id,
    });

    // console.log(!!object);

    return { status: StatusCodes.OK, text: 'success' };
  }

  async getObjects(req: any) {
    const token = req.headers.authorization;
    const result = jwt.verify(token, process.env.JWT);
    const user = await User.findOne({
      where: { email: result.email },
    });

    const objects = await EstateObjectRights.findAll({
      include: [{ model: EstateObject }],
      where: { userId: user.id },
    });

    // // console.log(objects);
    return objects;
  }

  async getObjectsWithNotifications(req: any) {
    const token = req.headers.authorization;
    const result = jwt.verify(token, process.env.JWT);
    const user = await User.findOne({
      where: { email: result.email },
    });

    const objects = await EstateObjectRights.findAll({
      include: [
        {
          model: EstateObject,
          as: 'estateObject',
          include: [
            {
              model: ChatRoom,
              as: 'chat',
              attributes: [
                'id',
                // [
                //   Sequelize.fn(
                //     'COUNT',
                //     Sequelize.col('estateObject.chat.messages.id'),
                //   ),
                //   'count',
                // ],
              ],
              include: [
                {
                  model: RoomAccess,
                  as: 'accesses',
                  attributes: ['updatedAt'],
                  where: { userId: user.id },
                  required: true,
                },
                {
                  model: Message,
                  as: 'messages',
                  attributes: ['id'],
                  required: false,
                  where: {
                    updatedAt: {
                      [Op.gte]: Sequelize.col(
                        'estateObject.chat.accesses.updatedAt',
                      ),
                    },
                  },
                  include: [{ model: User, attributes: ['role'] }],
                },
              ],
            },
          ],
        },
      ],
      group: [
        'EstateObjectRights.id',
        'estateObject.id',
        'estateObject.chat.id',
        'estateObject.chat.accesses.id',
        'estateObject.chat.messages.id',
        'estateObject.chat.messages.user.id',
      ],
      where: { userId: user.id },
    });

    // // console.log(objects);
    return objects;
  }

  // async getMessagesNumber(req: any): Promise<IRequestMessage> {
  //   async function getMessagesPerRoom(room: any) {
  //     const perRoom = await Message.count({
  //       where: {
  //         updatedAt: { [Op.gte]: room.updatedAt as Date },
  //         roomId: room.roomId,
  //       },
  //     });
  //     return { room: room.roomId, amount: perRoom };
  //   }

  //   const token = req.headers.authorization;
  //   const result = jwt.verify(token, process.env.JWT);

  //   try {
  //     const access = await RoomAccess.findAll({
  //       include: [
  //         { model: User, where: { email: result.email }, attributes: ['id'] },
  //       ],
  //     });

  //     const rooms = access.map((item) => {
  //       return { roomId: item.roomId, updatedAt: item.updatedAt };
  //     });

  //     // console.log(rooms);

  //     const results = await async.map(rooms, getMessagesPerRoom);

  //     // console.log(results);

  //     return {
  //       status: StatusCodes.OK,
  //       message: 'Ok',
  //       data: results,
  //       // data: msgs,
  //     };
  //   } catch (e) {
  //     // console.log(e);
  //     return { status: StatusCodes.BAD_REQUEST, message: 'Ошибка', data: e };
  //   }
  // }

  async deleteObject(req: any, id: number) {
    const token = req.headers.authorization;
    const result = jwt.verify(token, process.env.JWT);
    const user = await User.findOne({
      where: { email: result.email },
    });

    const object = await EstateObjectRights.findOne({
      include: [{ model: EstateObject }],
      where: { id: id, userId: user.id },
    });
    // // console.log(object);
    await object.destroy();

    await this.deleteUnauthorizedChatsAccess(user.id);
    // await ChatRoomsService.getRooms();

    return { status: StatusCodes.OK, text: 'success' };
  }

  async getObjectById(req: any, id: number) {
    const token = req.headers.authorization;
    const result = jwt.verify(token, process.env.JWT);
    const user = await User.findOne({
      where: { email: result.email },
    });
    const object = await EstateObjectRights.findOne({
      include: [{ model: EstateObject }],
      where: { id: id, userId: user.id },
    });
    return object;
  }

  async updateObject(req: any, updateEstateObjectDto: UpdateEstateObjectDto) {
    // console.log(updateEstateObjectDto);
    const {
      email,
      id,
      address,
      latitude,
      longitude,
      apartment,
      account,
      isOwner,
    } = updateEstateObjectDto;

    const user = await User.findOne({ where: { email: email } });

    const shortAddress =
      address.split(', ').at(-2) + ', ' + address.split(', ').at(-1);
    // console.log(shortAddress);

    const [chatRoom, created] = await ChatRoom.findOrCreate({
      where: { address: shortAddress },
    });

    if (!created) {
      // console.log('room exists');
    }

    // console.log(!!chatRoom);

    const object = await EstateObject.findOne({
      where: {
        // address: address,
        // apartment: apartment,
        // latitude: latitude,
        // longitude: longitude,
        id: id,
      },
    });

    if (!!object) {
      await object.update({
        address: address,
        apartment: apartment,
        // account: account,
        roomId: chatRoom.id,
        point: { type: 'Point', coordinates: [longitude, latitude] },
        //flipped
      });
    } else {
      throw new HttpException('Что-то пошло не так', StatusCodes.BAD_REQUEST, {
        cause: new Error('Some Error'),
      });
    }

    // // console.log(object);

    if (!object) {
      throw new HttpException('Что-то пошло не так', StatusCodes.BAD_REQUEST, {
        cause: new Error('Some Error'),
      });
    }

    const objectRight = await EstateObjectRights.findOne({
      where: {
        // isOwnerRatherThanTenant: isOwner,
        // account: account,
        estateObjectId: object.id,
        userId: user.id,
      },
    });

    if (!!objectRight) {
      // console.log('objectright exists');
    }

    await objectRight.update({
      isOwnerRatherThanTenant: isOwner,
      account: account,
    });

    // // console.log(objectRight);

    await this.deleteUnauthorizedChatsAccess(user.id);

    return { status: StatusCodes.OK, text: 'success' };
  }

  async approveWorkerObject(id: number) {
    try {
      // const user = await User.findOne({
      //   where: { email: result.email },
      //   include: [{ model: WorkerProfile }],
      // });

      const application = await NewWorkerObjectApplication.findOne({
        where: { id: id },
        include: [
          {
            model: WorkerProfile,
            include: [{ model: User, attributes: ['email'] }],
          },
        ],
      });

      const email = application.worker.user.email;
      const address = application.address;
      const latutide = application.point.coordinates[1];
      const longitude = application.point.coordinates[0];
      const role = application.role;
      const apartment = '-1';
      const account = '0';
      const isOwner = false;

      await application.destroy();

      await this.createObject({
        email,
        address,
        latitude: latutide,
        longitude,
        apartment,
        account,
        isOwner,
        role,
      });

      return { status: StatusCodes.OK, text: 'success' };
    } catch (e) {
      // console.log(e);
    }
  }
}
