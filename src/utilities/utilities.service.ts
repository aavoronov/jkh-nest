import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { StatusCodes } from 'http-status-codes';
import { WorkerProfile } from '../users/entities/worker-profile.entity';
import { Account } from './entities/account.entity';
import fetch from 'cross-fetch';

interface ITokenRequest {
  workerId: number;
  token: string;
}

@Injectable()
export class UtilitiesService {
  private handleSingleToken = async (token: ITokenRequest) => {
    const res = await fetch(
      `${process.env.RIAS_URL}accounts?access-token=${token.token}&fields=id,number`,
    );
    //   console.log(await res.json());
    const accounts = await res.json();
    accounts.map((account: { id: number; number: number }) => {
      Account.findOrCreate({
        where: {
          workerId: token.workerId,
          accountId: account.id,
          accountNumber: account.number,
        },
      });
    });
  };

  public getAccounts = async (tokens: ITokenRequest | Array<ITokenRequest>) => {
    try {
      if (!Array.isArray(tokens)) {
        this.handleSingleToken(tokens);
      } else {
        tokens.map((item) => this.handleSingleToken(item));
      }
    } catch (e) {
      console.log(e);
    }
  };

  public getHousesInfo = async (token: string) => {
    const houses = await fetch(
      `${process.env.RIAS_URL}houses?access-token=${token}&expand=entrances.premises.accounts`,
    )
      .then((res) => res.json())
      .catch((e) => console.log(e));
    // and?
  };

  async getSingleObjectData(acct: string) {
    if (isNaN(+acct)) {
      throw new HttpException(
        {
          type: 'critical',
          text: 'неправильный формат лицевого счета',
        },
        StatusCodes.BAD_REQUEST,
        {
          cause: new Error('some error'),
        },
      );
    }
    const account = await Account.findOne({
      where: { accountNumber: acct },
      include: [{ model: WorkerProfile, attributes: ['riasToken'] }],
    });
    console.log(account);
    if (!account) {
      throw new HttpException(
        {
          type: 'critical',
          text: 'ваша управляющая компания не предоставила к ним доступ',
        },
        StatusCodes.NOT_FOUND,
        {
          cause: new Error('some error'),
        },
      );
    }
    console.log(account.toJSON());
    console.log(account.worker.riasToken);

    // &fields=id,number
    const currentDate = new Date();

    const res = await fetch(
      `${process.env.RIAS_URL}payment-documents?access-token=${account.worker.riasToken}&accountId=${account.accountId}&year=2019&month=10`,
      // }&year=${currentDate.getFullYear()}&month=${currentDate.getMonth()}`,
    );

    const data = await res.json();

    if (Array.isArray(data)) {
      if (!data.length) {
        throw new HttpException(
          { type: 'warn', text: 'нет данных за последний расчетный период' },
          StatusCodes.NOT_FOUND,
          {
            cause: new Error('some error'),
          },
        );
      }
    } else if (!!data.errors) {
      throw new HttpException(
        { type: 'critical', text: data.errors.accountId },
        StatusCodes.NOT_FOUND,
        {
          cause: new Error('some error'),
        },
      );
    }

    return { sum: data[0].total_payable_by_pd_with_debt_and_advance };
    // console.log(await res.json());
    console.log(res);
    return `This action returns all utilities`;
  }

  // findAll() {
  //   return `This action returns all utilities`;
  // }

  findOne(id: number) {
    return `This action returns a #${id} utility`;
  }

  remove(id: number) {
    return `This action removes a #${id} utility`;
  }
}
