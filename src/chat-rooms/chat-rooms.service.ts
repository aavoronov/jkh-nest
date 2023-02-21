import { HttpException, Injectable } from '@nestjs/common';
import { StatusCodes } from 'http-status-codes';
import sequelize from 'sequelize';
import { EstateObjectRights } from '../estate-objects/entities/estate-object-rights.entity';
import { EstateObject } from '../estate-objects/entities/estate-object.entity';
import { Profile } from '../users/entities/profile.entity';
import { User } from '../users/entities/user.entity';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { SignUpToRoomDto } from './dto/sign-up-to-room.dto';
import { UpdateChatRoomDto } from './dto/update-chat-room.dto';
import { ChatRoom } from './entities/chat-room.entity';
import { RoomAccess } from './entities/room-access.entity';
import * as jwt from 'jsonwebtoken';
import { Verifications } from '../verifications/entities/verification.entity';

@Injectable()
export class ChatRoomsService {
  async getRooms(req) {
    const token = req.headers.authorization;
    const result = jwt.verify(token, process.env.JWT);
    const user = await User.findOne({
      where: { email: result.email },
      include: [{ model: Verifications }],
    });

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
              where: { userId: user.id },
              required: true,
              attributes: ['id'],
            },
          ],
        },
      ],
    });

    const roomsAvailable = chatRooms.map((item) => item.id);

    console.log(roomsAvailable);

    const rooms = await ChatRoom.findAll({ where: { id: roomsAvailable } });
    return rooms;
  }

  async signUp(signUpToRoomDto: SignUpToRoomDto) {
    try {
      const { email, chat } = signUpToRoomDto;
      console.log(email + chat);
      const user = await User.findOne({
        where: { email: email },
        attributes: ['id'],
      });

      const [newRoom, created] = await RoomAccess.findOrCreate({
        where: {
          userId: user.id,
          roomId: parseInt(chat),
        },
      });
      // console.log(newRoom.userId); // 'sdepold'
      // console.log(created); // The boolean indicating whether this instance was just created
      if (!created) {
        throw new HttpException(
          'Вы уже зарегистрированы в этом чате',
          StatusCodes.CONFLICT,
          {
            cause: new Error('Some Error'),
          },
        );
      }

      if (!newRoom) {
        throw new HttpException(
          'Внутренняя ошибка сервера',
          StatusCodes.NOT_FOUND,
          {
            cause: new Error('Some Error'),
          },
        );
      }
      return { status: StatusCodes.CREATED, message: 'Success' };
    } catch (e) {
      throw new HttpException(e.message, e.status, {
        cause: new Error('Some Error'),
      });
    }
  }

  async leaveChat(email: string, chat: string) {
    try {
      console.log(email + chat);
      const user = await User.findOne({
        where: { email: email },
        attributes: ['id'],
      });

      const room = await RoomAccess.destroy({
        where: {
          userId: user.id,
          roomId: parseInt(chat),
        },
      });

      if (room === 0) {
        throw new HttpException(
          'Внутренняя ошибка сервера',
          StatusCodes.BAD_REQUEST,
          {
            cause: new Error('Some Error'),
          },
        );
      }
      return { status: StatusCodes.OK, message: 'Success' };
    } catch (e) {
      throw new HttpException(e.message, e.status, {
        cause: new Error('Some Error'),
      });
    }
  }

  async getMy(email: string) {
    try {
      const user = await User.findOne({
        where: { email: email },
        attributes: ['id'],
      });
      const chats = await RoomAccess.findAll({
        where: { userId: user.id },
        include: [{ model: ChatRoom, as: 'chat' }],
        attributes: ['id'],
      });
      return chats;
    } catch (e) {
      throw new HttpException(e.message, e.status, {
        cause: new Error('Some Error'),
      });
    }
  }

  async getUsers(id: number) {
    try {
      const users = await RoomAccess.findAll({
        where: { roomId: id },
        attributes: [],
        include: [
          {
            model: User,
            attributes: ['id'],
            include: [
              {
                model: Profile,
                attributes: ['pseudonym', 'color', 'profilePic'],
              },
            ],
          },
        ],
      });
      return { roomId: id, users: users };
    } catch (e) {
      throw new HttpException(e.message, e.status, {
        cause: new Error('Some Error'),
      });
    }
  }

  async createTimeRecord(email: string, chat: number): Promise<void> {
    try {
      const user = await User.findOne({
        where: { email: email },
        attributes: ['id'],
      });
      console.log(user.id, chat);
      const record = await RoomAccess.findOne({
        where: { userId: parseInt(user.id), roomId: chat },
      });

      record.changed('updatedAt', true);
      await record.update({
        updatedAt: new Date(),
      });

      // { updatedAt: sequelize.literal('CURRENT_TIMESTAMP') },
      // console.log(updated);
    } catch (e) {
      console.log(e);
    }
  }

  create(createChatRoomDto: CreateChatRoomDto) {
    return 'This action adds a new chatRoom';
  }

  findOne(id: number) {
    return `This action returns a #${id} chatRoom`;
  }

  update(id: number, updateChatRoomDto: UpdateChatRoomDto) {
    return `This action updates a #${id} chatRoom`;
  }

  remove(id: number) {
    return `This action removes a #${id} chatRoom`;
  }
}
