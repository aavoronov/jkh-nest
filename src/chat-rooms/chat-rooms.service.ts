import { HttpException, Injectable } from '@nestjs/common';
import { StatusCodes } from 'http-status-codes';
import sequelize from 'sequelize';
import { EstateObjectRights } from '../estate-objects/entities/estate-object-rights.entity';
import { EstateObject } from '../estate-objects/entities/estate-object.entity';
import { Profile } from '../users/entities/profile.entity';
import { User } from '../users/entities/user.entity';
import { SignUpToRoomDto } from './dto/sign-up-to-room.dto';
import { ChatRoom } from './entities/chat-room.entity';
import { RoomAccess } from './entities/room-access.entity';
import * as jwt from 'jsonwebtoken';
import { Verifications } from '../verifications/entities/verification.entity';
import { WorkerProfile } from '../users/entities/worker-profile.entity';
import { GenericData } from '../generic-data/entities/generic-data.entity';
import { RegisterWorkerObjectDto } from './dto/register-worker-object.dto';
import { NewWorkerObjectApplication } from './entities/worker-object-application.entity';
import { MailerService } from '../mailer/mailer.service';
import { EstateObjectsService } from '../estate-objects/estate-objects.service';

const mailer = new MailerService();

@Injectable()
export class ChatRoomsService {
  async getRooms(req: any) {
    try {
      const token = req.headers.authorization;
      const result = jwt.verify(token, process.env.JWT);
      const user = await User.findOne({
        where: { email: result.email },
      });

      // console.log('user', user);

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
    } catch (e) {
      console.log('e', e);
    }
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
              {
                model: WorkerProfile,
                attributes: ['name', 'color', 'profilePic'],
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

  async getAdPrices(req: any): Promise<any[]> {
    try {
      // console.log(radii);
      const token = req.headers.authorization;
      const result = jwt.verify(token, process.env.JWT);
      const user = await User.findOne({
        where: { email: result.email },
        include: [{ model: WorkerProfile }],
      });

      const companyCoordinates = user.workerProfile.point.coordinates;
      const companyId = user.workerProfile.id;

      console.log(companyCoordinates);

      const radii = await (
        await GenericData.findOne({
          where: { key: 'chatAdRadiusOptions' },
        })
      ).value
        .slice(1, -1)
        .split(',');

      console.log(radii);

      const regularPriceMultiplier = await (
        await GenericData.findOne({
          where: { key: 'regularPriceMultiplier' },
        })
      ).value;

      const millionaireCityPriceMultiplier = await (
        await GenericData.findOne({
          where: { key: 'millionaireCityPriceMultiplier' },
        })
      ).value;

      console.log(+regularPriceMultiplier, +millionaireCityPriceMultiplier);

      const millionaireCitiesBoundaries: {
        name: string;
        point: [number, number];
        radius: number;
      }[] = [
        { name: 'Moscow', point: [55.74749, 37.62773], radius: 21000 },
        { name: 'Spb', point: [59.9512, 30.3405], radius: 17500 },
        { name: 'Novosibirsk', point: [55.00576, 82.92388], radius: 12200 },
        { name: 'Ekaterinburg', point: [56.83684, 60.6023], radius: 10000 },
        { name: 'Kazan', point: [55.79881, 49.1519], radius: 9000 },
        { name: 'Nizhny', point: [56.28139, 43.91207], radius: 12200 },
        { name: 'Chelyabinsk', point: [55.18012, 61.40491], radius: 10800 },
        { name: 'Krasnoyarsk', point: [56.01634, 92.9331], radius: 9100 },
        { name: 'Samara', point: [53.19475, 50.20262], radius: 9600 },
        { name: 'Ufa', point: [54.75237, 56.01324], radius: 8900 },
        { name: 'Rostov-na-Donu', point: [47.23239, 39.72394], radius: 9450 },
        { name: 'Omsk', point: [54.99134, 73.35479], radius: 9500 },
        { name: 'Krasnodar', point: [45.05099, 39.01909], radius: 10900 },
        { name: 'Voronezh', point: [51.67535, 39.19232], radius: 9600 },
        { name: 'Perm', point: [57.98498, 56.2172], radius: 10400 },
        { name: 'Volgograd', point: [48.76995, 44.54393], radius: 16200 },
      ];

      const getIsInCircleForOneCity = async (city: {
        name: string;
        point: [number, number];
        radius: number;
      }): Promise<boolean> => {
        const query = `
      SELECT
          "id", ST_DistanceSphere(ST_MakePoint(:latitude, :longitude), "point") AS distance
      FROM
          "WorkerProfiles"
      WHERE
          "id" = ${companyId}
      `;

        const latitude = city.point[1];
        const longitude = city.point[0];
        // ST_FlipCoordinates(geometry geom)
        //! important

        const distance: any = await WorkerProfile.sequelize.query(query, {
          replacements: {
            latitude: latitude,
            longitude: longitude,
          },
        });

        const result: number = distance[0][0].distance;
        console.log(city.name, result);

        return city.radius > result;
      };

      const withinAMillionaireCity = await Promise.all(
        millionaireCitiesBoundaries.map(getIsInCircleForOneCity),
      );

      console.log(withinAMillionaireCity);

      const getRoomsForOneRadius = async (
        radius: number,
      ): Promise<{
        radius: number;
        chats: number;
        ids: unknown[];
        users: number;
        price: number;
      }> => {
        const query = `
      SELECT
          *, ST_DistanceSphere(ST_MakePoint(:latitude, :longitude), "point") AS distance
      FROM
          "EstateObjects"
      INNER JOIN 
          "ChatRooms" AS "chat" ON "EstateObjects"."roomId" = "chat"."id"
      WHERE
          ST_DistanceSphere(ST_MakePoint(:latitude, :longitude), "point") < :maxDistance
      `;

        const latitude = companyCoordinates[0];
        const longitude = companyCoordinates[1];
        // const latitude = '55.6';
        // const longitude = '37.9';

        const chatsAround: any = await EstateObject.sequelize.query(query, {
          replacements: {
            latitude: latitude,
            longitude: longitude,
            maxDistance: radius,
          },
        });

        const chatRooms = new Set();
        chatsAround[0].map((item) => chatRooms.add(item.roomId));

        let usersNumber = 0;

        const getUsersForOneChat = async (roomId: number) => {
          const users = await RoomAccess.count({ where: { roomId: roomId } });
          // console.log(users);
          usersNumber += users;
        };

        const chatsArray = Array.from(chatRooms);
        // chatRooms.forEach(async (item) => {
        //   const users = await RoomAccess.count({ where: { roomId: item } });
        //   console.log(users);
        //   usersNumber += users;
        // });

        await Promise.all(chatsArray.map(getUsersForOneChat));

        // const users =
        // console.log(estateObjects);
        const multiplier = withinAMillionaireCity.includes(true)
          ? +millionaireCityPriceMultiplier
          : +regularPriceMultiplier;

        return {
          radius: radius,
          chats: chatRooms.size,
          ids: chatsArray,
          users: usersNumber,
          price: usersNumber * multiplier,
        };
      };

      const prices = await Promise.all(radii.map(getRoomsForOneRadius));

      console.log(prices);
      return prices;
    } catch (e) {
      console.log(e);
    }
  }

  async registerWorkerObject(
    req: any,
    registerWorkerObjectDto: RegisterWorkerObjectDto,
  ): Promise<void> {
    try {
      const { address, longitude, latitude } = registerWorkerObjectDto;
      console.log(registerWorkerObjectDto);

      const token = req.headers.authorization;
      const result = jwt.verify(token, process.env.JWT);
      const user = await User.findOne({
        where: { email: result.email },
        include: [{ model: WorkerProfile }],
      });

      const existingRecord = await NewWorkerObjectApplication.findOne({
        where: { workerId: user.workerProfile.id, address: address },
      });

      if (!!existingRecord) {
        throw new HttpException(
          'Вы уже зарегистрировали этот объект. Ожидайте одобрения',
          StatusCodes.CONFLICT,
          {
            cause: new Error('some error'),
          },
        );
      }

      const record = await NewWorkerObjectApplication.create({
        workerId: user.workerProfile.id,
        address: address,
        point: { type: 'Point', coordinates: [longitude, latitude] },
      });

      await mailer.newWorkerObjectApplication(record.id);
    } catch (e) {
      console.log(e);
    }
  }
}

// await EstateObject.create({
//   address: address,
//   apartment: apartment,
//   // account: account,
//   roomId: chatRoom.id,
//   point: { type: 'Point', coordinates: [longitude, latitude] },
//   //flipped
// })
