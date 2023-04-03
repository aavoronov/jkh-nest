import { HttpException, Injectable } from '@nestjs/common';
import { CreateChatAdDto } from './dto/create-chat-ad.dto';
import { UpdateChatAdDto } from './dto/update-chat-ad.dto';
import * as jwt from 'jsonwebtoken';
import { User } from '../users/entities/user.entity';
import { WorkerProfile } from '../users/entities/worker-profile.entity';
import { ChatAd } from './entities/chat-ad.entity';
import { StatusCodes } from 'http-status-codes';
import { MailerService } from '../mailer/mailer.service';
import { TransactionsService } from '../transactions/transactions.service';
import { TransactionTypes } from '../transactions/dto/create-transaction.dto';
import { PayForChatAdDto } from './dto/pay-for-chat-ad-dto';
import {
  IEmailChatAdApproval,
  IEmailUpdatePassword,
} from '../mailer/interfaces/email.body';

const mailerService = new MailerService();

@Injectable()
export class ChatAdService {
  constructor(private readonly transactionsService: TransactionsService) {}
  async createChatAd(req: any, createChatAdDto: CreateChatAdDto) {
    try {
      const {
        filename,
        description,
        link,
        hours,
        minutes,
        radius,
        chats,
        price,
      } = createChatAdDto;
      console.log(createChatAdDto);
      const token = req.headers.authorization;
      const result = jwt.verify(token, process.env.JWT);
      const user = await User.findOne({
        where: { email: result.email },
        include: [{ model: WorkerProfile }],
      });

      console.log(user.workerProfile.id);

      const chatsArray = chats.split(',').map((item) => +item);

      const newAd = await ChatAd.create({
        image: filename,
        description,
        link,
        time: `${hours}:${minutes}`,
        // radius,
        chats: chatsArray,
        workerId: user.workerProfile.id,
        sum: +price,
      });

      if (!newAd) {
        throw new HttpException('Серверная ошибка', StatusCodes.BAD_GATEWAY, {
          cause: new Error('some Error'),
        });
      }

      await mailerService.newChatAdApplication(newAd.id);
    } catch (e) {
      console.log(e);
    }
    // return 'This action adds a new chatAd';
  }

  async getMyChatAds(req: any) {
    try {
      const token = req.headers.authorization;
      const result = jwt.verify(token, process.env.JWT);
      const user = await User.findOne({
        where: { email: result.email },
        include: [{ model: WorkerProfile }],
      });

      const myAds = await ChatAd.findAll({
        where: { workerId: user.workerProfile.id },
      });
      return myAds;
    } catch (e) {
      console.log(e);
    }
  }

  async payForChatAd(req: any, payForChatAdDto: PayForChatAdDto) {
    try {
      const { id, sum } = payForChatAdDto;
      const token = req.headers.authorization;
      const result = jwt.verify(token, process.env.JWT);

      const ad = await ChatAd.findOne({
        where: { id: id },
        include: [
          {
            model: WorkerProfile,
            include: [{ model: User, attributes: ['id'] }],
          },
        ],
      });

      console.log(ad);

      // const user = await User.findOne({
      //   where: { email: result.email },
      //   include: [{ model: WorkerProfile, as: 'WorkerProfile' }],
      // });

      // const ad = await ChatAd.findOne({
      //   where: { workerId: user.workerProfile.id, id: id },
      // });

      await ad.update({ isPaid: true });

      console.log(ad.worker.user.id, ad.id);

      await this.transactionsService.createTransaction({
        userId: ad.worker.user.id,
        objectId: ad.id,
        basis: TransactionTypes.chatAd,
        sum: +sum,
      });
      return { status: StatusCodes.OK, text: 'success' };
    } catch (e) {
      console.log(e);
    }
  }

  async approveChatAd(id: number) {
    // if token.role === 'admin'
    try {
      console.log(id);
      const ad = await ChatAd.findOne({
        where: { id: id },
        include: [
          {
            model: WorkerProfile,
            include: [{ model: User, attributes: ['email'] }],
          },
        ],
      });

      await ad.update({ isApproved: true });

      // console.log(ad);

      const bodyEmail: IEmailChatAdApproval = {
        email: ad.worker.user.email,
        description: ad.description,
      };
      await mailerService.notifyOfChatAdApproval(bodyEmail);
      return 'ok';
    } catch (e) {
      console.log(e);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} chatAd`;
  }

  update(id: number, updateChatAdDto: UpdateChatAdDto) {
    return `This action updates a #${id} chatAd`;
  }

  async deleteChatAd(req: any, id: number) {
    try {
      const token = req.headers.authorization;
      const result = jwt.verify(token, process.env.JWT);
      const user = await User.findOne({
        where: { email: result.email },
        include: [{ model: WorkerProfile }],
      });

      const ad = await ChatAd.findOne({
        where: { workerId: user.workerProfile.id, id: id },
      });
      await ad.destroy();
      console.log(ad);
      return { status: StatusCodes.OK, text: 'success' };
    } catch (e) {
      console.log(e);
    }
  }
}
