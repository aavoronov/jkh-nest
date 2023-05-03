import { HttpException, Injectable } from '@nestjs/common';
import { StatusCodes } from 'http-status-codes';
import {
  CreateTransactionDto,
  TransactionTypes,
} from './dto/create-transaction.dto';

import { Transaction } from './entities/transaction.entity';
import { User } from '../users/entities/user.entity';

import * as jwt from 'jsonwebtoken';
import { WorkerProfile } from '../users/entities/worker-profile.entity';

@Injectable()
export class TransactionsService {
  async createTransaction(createTransactionDto: CreateTransactionDto) {
    const { userId, objectId, basis, sum } = createTransactionDto;
    try {
      console.log(createTransactionDto);
      const transaction = await Transaction.create(createTransactionDto);
      return { status: StatusCodes.OK, text: 'success' };
    } catch (e) {
      throw new HttpException('Ошибка', StatusCodes.BAD_REQUEST, {
        cause: new Error('some error'),
      });
    }
    // return 'This action adds a new transaction';
  }

  async getMyTransactions(req: any, page = 1) {
    try {
      const limit = 10;
      // const page = 1;
      const offset = page * limit - limit;

      const token = req.headers.authorization;
      const result = jwt.verify(token, process.env.JWT);
      const user = await User.findOne({
        where: { email: result.email },
      });

      const transactions = await Transaction.findAll({
        where: { userId: user.id },
        order: [['id', 'DESC']],
        limit,
        offset,
      });

      return transactions;
    } catch (e) {
      console.log('e', e);
      throw new HttpException('Ошибка', StatusCodes.BAD_REQUEST, {
        cause: new Error('some error'),
      });
    }
  }

  async getMyExpenses(req: any) {
    try {
      const token = req.headers.authorization;
      const result = jwt.verify(token, process.env.JWT);
      const user = await User.findOne({
        where: { email: result.email },
      });

      const transactions = await Transaction.findAll({
        where: { userId: user.id, basis: [TransactionTypes.chatAd] },
        attributes: ['sum'],
        order: [['id', 'DESC']],
      });

      let sum = 0;
      transactions.forEach((item) => (sum += item.sum));
      console.log('sum', sum);

      return sum;
    } catch (e) {
      console.log('e', e);
      throw new HttpException('Ошибка', StatusCodes.BAD_REQUEST, {
        cause: new Error('some error'),
      });
    }
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} transaction`;
  // }

  // update(id: number, updateTransactionDto: UpdateTransactionDto) {
  //   return `This action updates a #${id} transaction`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} transaction`;
  // }
}
