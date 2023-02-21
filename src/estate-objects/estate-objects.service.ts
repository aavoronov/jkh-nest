import { HttpException, Injectable } from '@nestjs/common';
import { StatusCodes } from 'http-status-codes';
import { Op } from 'sequelize';
import { ChatRoom } from '../chat-rooms/entities/chat-room.entity';
import { User } from '../users/entities/user.entity';
import { CreateEstateObjectDto } from './dto/create-estate-object.dto';
import { UpdateEstateObjectDto } from './dto/update-estate-object.dto';
import { EstateObjectRights } from './entities/estate-object-rights.entity';
import { EstateObject } from './entities/estate-object.entity';
import * as jwt from 'jsonwebtoken';
import { Verifications } from '../verifications/entities/verification.entity';
import { ChatRoomsService } from '../chat-rooms/chat-rooms.service';
import { RoomAccess } from '../chat-rooms/entities/room-access.entity';

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
    // console.log(roomsAvailable);
    // console.log(myChats);
    const chatsToDelete = myChats.filter(
      (item) => !roomsAvailable.includes(item),
    );

    console.log(chatsToDelete);

    if (!!chatsToDelete.length) {
      const room = await RoomAccess.destroy({
        where: {
          userId: userId,
          roomId: chatsToDelete[0],
        },
      });

      console.log(room);
    }
  }

  async createObject(createEstateObjectDto: CreateEstateObjectDto) {
    console.log(createEstateObjectDto);
    const { email, address, latitude, longitude, apartment, account, isOwner } =
      createEstateObjectDto;

    const user = await User.findOne({ where: { email: email } });

    const shortAddress =
      address.split(', ').at(-2) + ', ' + address.split(', ').at(-1);
    console.log(shortAddress);

    const [chatRoom, created] = await ChatRoom.findOrCreate({
      where: { address: shortAddress },
    });

    if (!created) {
      console.log('room exists');
    }

    console.log(!!chatRoom);

    let object = await EstateObject.findOne({
      where: {
        address: address,
        apartment: apartment,
        latitude: latitude,
        longitude: longitude,
      },
    });

    if (!!object) {
      // throw new HttpException(
      //   'Вы уже зарегистрировали этот объект',
      //   StatusCodes.CONFLICT,
      //   {
      //     cause: new Error('Some Error'),
      //   },
      // );
      console.log('object exists');
    } else {
      object = await EstateObject.create({
        address: address,
        apartment: apartment,
        // account: account,
        roomId: chatRoom.id,
        latitude: latitude,
        longitude: longitude,
      });
    }

    // console.log(object);

    if (!object) {
      throw new HttpException('Что-то пошло не так', StatusCodes.BAD_REQUEST, {
        cause: new Error('Some Error'),
      });
    }

    let objectRight = await EstateObjectRights.findOne({
      where: {
        // isOwnerRatherThanTenant: isOwner,
        // account: account,
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
      account: account,
      estateObjectId: object.id,
      userId: user.id,
    });

    console.log(!!object);

    return { status: StatusCodes.OK, text: 'success' };
  }

  async getObjects(req) {
    const token = req.headers.authorization;
    const result = jwt.verify(token, process.env.JWT);
    const user = await User.findOne({
      where: { email: result.email },
    });

    const objects = await EstateObjectRights.findAll({
      include: [{ model: EstateObject }],
      where: { userId: user.id },
    });

    // console.log(objects);
    return objects;
  }

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
    // console.log(object);
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
    console.log(updateEstateObjectDto);
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
    console.log(shortAddress);

    const [chatRoom, created] = await ChatRoom.findOrCreate({
      where: { address: shortAddress },
    });

    if (!created) {
      console.log('room exists');
    }

    console.log(!!chatRoom);

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
        latitude: latitude,
        longitude: longitude,
      });
    } else {
      throw new HttpException('Что-то пошло не так', StatusCodes.BAD_REQUEST, {
        cause: new Error('Some Error'),
      });
    }

    // console.log(object);

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
      console.log('objectright exists');
    }

    await objectRight.update({
      isOwnerRatherThanTenant: isOwner,
      account: account,
    });

    // console.log(objectRight);

    await this.deleteUnauthorizedChatsAccess(user.id);

    return { status: StatusCodes.OK, text: 'success' };
  }
}
