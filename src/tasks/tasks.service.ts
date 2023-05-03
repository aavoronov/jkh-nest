import { HttpException, Injectable, Logger } from '@nestjs/common';
import { Cron, Interval, Timeout } from '@nestjs/schedule';
import { Op, Sequelize } from 'sequelize';
import { ChatAd } from '../chat-ad/entities/chat-ad.entity';
import { WorkerProfile } from '../users/entities/worker-profile.entity';
import { Account } from '../utilities/entities/account.entity';
import { UtilitiesService } from '../utilities/utilities.service';
import { IMessageBody } from '../chat/interfaces/interface';
import { Message } from '../chat/entities/message.entity';
import { StatusCodes } from 'http-status-codes';

import { ChatGateway } from '../chat/chat.gateway';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TasksService {
  constructor(
    private readonly utilitiesService: UtilitiesService,
    private chatGateway: ChatGateway,
  ) {}
  private readonly logger = new Logger(TasksService.name);

  // @Cron('0 0 3 * * *')
  // async handleCron() {
  //   const profiles = await WorkerProfile.findAll({
  //     where: { riasToken: { [Op.ne]: null } },
  //   });
  //   const tokens = profiles.map((item) => {
  //     return { workerId: item.id, token: item.riasToken };
  //   });

  //   await this.utilitiesService.getAccounts(tokens);

  //   this.logger.debug('Cron fired');
  // }

  @Cron('*/5 * * * *')
  async checkChatAds() {
    const currentTime = new Date();

    const adsToFire = await ChatAd.findAll({
      where: Sequelize.literal(
        `"ChatAd"."isApproved" = true AND "ChatAd"."isPaid" = true AND "ChatAd"."time" BETWEEN current_time + (INTERVAL '10520 SECONDS') AND current_time  + (INTERVAL '10810 SECONDS')`,
      ),
      include: [{ model: WorkerProfile }],

      // countLeft: {
      //   [Op.gte]: 0,
      // },
    });

    console.log(adsToFire);

    const sendMessageForOneAd = async (ad: ChatAd) => {
      // const body: IMessageBody = {
      //   email: 'test',
      // };
      // email: string;
      // pseudonym: string;
      // text: string;
      // color: string;
      // profilePic: string | undefined;
      // // file: Buffer | Blob | string | undefined;
      // file: string | undefined;
      // filename: string | undefined;
      // roomId: string;

      async function createDbMessageForOneRoom(roomId: number) {
        const newMessage = await Message.create({
          userId: ad.worker.userId,
          message: ad.description,
          file: ad.image,
          roomId: roomId,
          chatAdId: ad.id,
        });
        if (!newMessage) {
          throw new HttpException('Ошибка', StatusCodes.BAD_REQUEST, {
            cause: new Error('Some Error'),
          });
        }
      }

      const payload = {
        // email: message.email,
        message: ad.description,
        link: ad.link,
        name: ad.worker.name,
        time: currentTime,
        color: ad.worker.color,
        profilePic: ad.worker.profilePic,
        file: ad.image,
        roomId: ad.chats,
        isPaid: true,
      };

      const stringChats = ad.chats.map((item) => item.toString());

      try {
        // this.chatGateway.io.in(stringChats[0]).emit('message', payload);
        // this.chatGateway.io.to(['1', '2']).emit('message', payload);
        this.chatGateway.io.emit('message', payload);
        console.log('emits');
        // console.log(this.chatGateway.io);
        // const sockets = this.chatGateway.io.sockets;
        // const rooms = this.chatGateway.io.adapter.rooms;
        // const sids = this.chatGateway.io.adapter.sids;

        // console.log(sockets.size);
        // console.log(rooms);
        // console.log(sids);
      } catch (e) {
        console.log(e);
      }

      // const io =

      Promise.all(ad.chats.map(createDbMessageForOneRoom)).then();

      // this.io.to(ad.chats).emit('message', payload);
    };

    // adsToFire.forEach()

    // await this.utilitiesService.getAccounts(tokens);

    Promise.all(adsToFire.map(sendMessageForOneAd));

    this.logger.debug('Cron fired');
  }

  //   @Interval(10000)
  //   handleInterval() {
  //     this.logger.debug('Called every 10 seconds');
  //   }

  //   @Timeout(5000)
  //   handleTimeout() {
  //     this.logger.debug('Called once after 5 seconds');
  //   }

  @Timeout(30 * 1000)
  async handleTimeout() {
    this.logger.debug('Called once after 5 seconds');
    const admin = await User.findOne({
      where: { email: 'admin@example.com', role: 'admin' },
    });

    this.logger.debug(!!admin && 'admin exists');

    if (!admin) {
      await User.create({
        email: 'admin@example.com',
        password:
          '$2b$10$wYFl4Y1lSzc2SHmsaKN9k.NdXhL8xgGXJFjWN5B4vJNvUHenF7iCW',
        role: 'admin',
      });
      this.logger.debug(!!admin && 'admin created');
    }
  }
}
