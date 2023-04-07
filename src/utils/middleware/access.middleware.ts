import {
  Inject,
  Injectable,
  NestMiddleware,
  Next,
  Req,
  Res,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class AccessMiddleware implements NestMiddleware {
  //   constructor(@InjectModel(User) private courseModel: typeof User) {}

  async use(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    console.log(req.body.access);
    const send = {
      status: StatusCodes.UNAUTHORIZED,
      message: 'UNAUTHORIZED',
    };
    try {
      if (!req.body.access) {
        return res.status(StatusCodes.BAD_REQUEST).send(send);
      }
      switch (req.body.role) {
        case 'admin':
          return next();
        case 'user':
          return next();
        case 'uk':
          return next();
        case 'upravdom':
          return next();

        default:
          return res.status(StatusCodes.BAD_REQUEST).send(send);
      }
    } catch (e) {
      return res.status(StatusCodes.BAD_REQUEST).send({ ...send, data: e });
    }
  }
}
