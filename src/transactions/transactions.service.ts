import { HttpException, Injectable } from '@nestjs/common';
import { StatusCodes } from 'http-status-codes';
import { CreateTransactionDto } from './dto/create-transaction.dto';

import { Transaction } from './entities/transaction.entity';

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

  // findAll() {
  //   return `This action returns all transactions`;
  // }

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
