import { HttpException, Injectable } from '@nestjs/common';
import { CreatePollDto } from './dto/create-poll.dto';
import { UpdatePollDto } from './dto/update-poll.dto';
import { User } from '../users/entities/user.entity';
import * as jwt from 'jsonwebtoken';
import { Poll } from './entities/poll.entity';
import { PollOption } from './entities/poll-options.entity';
import { StatusCodes } from 'http-status-codes';
import { PollReply } from './entities/poll-reply.entity';
import { Sequelize } from 'sequelize';
import { ChatRoom } from '../chat-rooms/entities/chat-room.entity';

@Injectable()
export class PollsService {
  async createPoll(req: any, createPollDto: CreatePollDto) {
    try {
      async function createPollForOneChat(chat: number) {
        const poll = await Poll.create({
          question,
          isMultipleChoice: multipleChoice,
          workerId: user.id,
          chatId: chat,
        });

        async function createPollOption(option: string) {
          await PollOption.create({
            pollId: poll.id,
            option: option,
          });
        }

        Promise.all(options.map(createPollOption)).catch((reason) => {
          console.log(reason);
          throw new HttpException(reason, StatusCodes.BAD_REQUEST, {
            cause: new Error('Cause Error'),
          });
        });
      }

      const token = req.headers.authorization;
      const result = jwt.verify(token, process.env.JWT);
      const user = await User.findOne({
        where: { email: result.email },
      });

      const { question, options, multipleChoice, chats } = createPollDto;

      Promise.all(chats.map(createPollForOneChat))
        .catch((reason) => {
          console.log(reason);
          throw new HttpException(reason, StatusCodes.BAD_REQUEST, {
            cause: new Error('Cause Error'),
          });
        })
        .then(
          (resolve) => {
            return 'This action adds a new poll';
          },
          (reject) => {
            throw new HttpException(reject, StatusCodes.BAD_REQUEST, {
              cause: new Error('Cause Error'),
            });
          },
        );

      // const options = await PollOption.create();
    } catch (e) {
      console.log(e);
    }
  }

  async getMyPollsAsWorker(req: any) {
    try {
      const token = req.headers.authorization;
      const result = jwt.verify(token, process.env.JWT);
      const user = await User.findOne({
        where: { email: result.email },
      });

      // const polls = await Poll.findAll({
      //   where: { workerId: user.id },
      //   include: [
      //     {
      //       model: PollOption,
      //       attributes: [
      //         [
      //           Sequelize.fn('COUNT', Sequelize.col('options.reply.id')),
      //           'votes',
      //         ],
      //       ],
      //       // group: ['options.id'],
      //       include: [{ model: PollReply }],
      //     },
      //   ],
      //   group: ['Poll.id', 'options.id', 'options.reply.id'],
      // });

      const polls = await Poll.findAll({
        where: { workerId: user.id },
        attributes: ['isMultipleChoice', 'question'],
        include: [
          {
            model: PollOption,
            attributes: ['option'],
            include: [{ model: PollReply, attributes: ['id'] }],
          },
          {
            model: ChatRoom,
          },
        ],
      });

      // const polls: any = pollsRaw.map((el) => el.get({ plain: true }));
      // const res = polls.map(
      //   (item) => (item.options.votes = item.options.replies.length),
      // );

      return polls;
    } catch (e) {
      console.log('e', e);
    }
  }

  async getMyPollsAsWorkerPerChat(req: any, chat: number) {
    try {
      console.log(chat);
      const token = req.headers.authorization;
      const result = jwt.verify(token, process.env.JWT);
      const user = await User.findOne({
        where: { email: result.email },
      });

      const polls = await Poll.findAll({
        where: { workerId: user.id, chatId: chat },
        attributes: ['isMultipleChoice', 'question'],
        include: [
          {
            model: PollOption,
            attributes: ['option'],
            include: [{ model: PollReply, attributes: ['id'] }],
          },
        ],
      });

      return polls;
    } catch (e) {
      console.log('e', e);
    }
  }

  async getMyPollsPerChat(req: any, chat: number) {
    try {
      console.log(chat);
      const token = req.headers.authorization;
      const result = jwt.verify(token, process.env.JWT);
      const user = await User.findOne({
        where: { email: result.email },
      });

      const role = result.role;
      console.log(role);

      const whereStatement: { chatId: number; workerId?: number } = {
        chatId: chat,
      };
      if (role !== 'user') {
        whereStatement.workerId = user.id;
      }

      const optionsAttributes = role === 'user' ? ['id', 'option'] : ['option'];

      const polls = await Poll.findAll({
        where: whereStatement,
        attributes: ['isMultipleChoice', 'question', 'id'],
        include: [
          {
            model: PollOption,
            attributes: optionsAttributes,
            include: [{ model: PollReply, attributes: ['id'] }],
          },
        ],
      });

      return polls;
    } catch (e) {
      console.log('e', e);
    }
  }

  async submitReply(req: any, optionId: number[]) {
    try {
      const token = req.headers.authorization;
      const result = jwt.verify(token, process.env.JWT);
      const user = await User.findOne({
        where: { email: result.email },
      });

      const poll = await PollOption.findOne({
        where: { id: optionId },
        include: [{ model: Poll }],
      });

      console.log(poll.poll.isMultipleChoice);

      console.log('optionId', optionId);

      const hasReplied = await PollOption.findOne({
        where: { pollId: poll.poll.id },
        include: [{ model: PollReply, where: { userId: user.id } }],
      });

      if (!!hasReplied) {
        throw new HttpException(
          'Вы уже голосовали в этом опросе',
          StatusCodes.CONFLICT,
          {
            cause: new Error('Cause Error'),
          },
        );
      }

      console.log(!!hasReplied);

      const createOneReply = async (optionId: number) => {
        const reply = await PollReply.create({
          userId: user.id,
          pollOptionId: optionId,
        });
      };

      if (poll.poll.isMultipleChoice && optionId.length > 1) {
        Promise.all(optionId.map(createOneReply)).then(
          (resolve) => {
            return { status: StatusCodes.OK, text: 'success' };
          },
          (reject) => {
            throw new HttpException(reject, StatusCodes.BAD_REQUEST, {
              cause: new Error('Cause Error'),
            });
          },
        );
      } else {
        createOneReply(optionId[0]);
      }

      return { status: StatusCodes.OK, text: 'success' };
      return poll;

      // if()
    } catch (e) {
      console.log('e', e);
      throw new HttpException(e.message, e.status, {
        cause: new Error('Some Error'),
      });
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} poll`;
  }

  update(id: number, updatePollDto: UpdatePollDto) {
    return `This action updates a #${id} poll`;
  }

  remove(id: number) {
    return `This action removes a #${id} poll`;
  }
}
