import {
  Injectable,
  NestMiddleware,
  Res,
  Req,
  Next,
  Inject,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { User } from '../../users/entities/user.entity';
import { InjectModel } from '@nestjs/sequelize';
import * as jwt from 'jsonwebtoken';
import { Verifications } from '../../verifications/entities/verification.entity';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  // constructor(@InjectModel(User) private userModel: typeof User) {}
  async use(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    const { authorization } = req.headers;
    console.log(authorization);

    //   const token = await req.headers.authorization;
    //   const result = await jwt.verify(token, process.env.JWT);
    //   // console.log(result);
    //   if (!!result.message) {
    //     throw new HttpException(
    //       'Сессия истекла или недействительна',
    //       StatusCodes.FORBIDDEN,
    //       {
    //         cause: new Error('Some Error'),
    //       },
    //     );
    //   }

    try {
      if (!authorization) {
        req.body = { ...req.body, access: false };
        return next();
      }
      const result = jwt.verify(authorization, process.env.JWT);
      const user = await User.findOne({
        where: { email: result.email },
        include: [{ model: Verifications }],
      });

      // console.log(user);

      if (!user || !!user.verification) {
        // if (!user || !user.verification) {
        console.log('here');
        req.body = { ...req.body, access: false };

        return next();
      }
      // if (user.isDeleted) {
      //   return res.status(StatusCodes.BAD_REQUEST).send({
      //     status: StatusCodes.BAD_REQUEST,
      //     message: 'BAD_REQUEST',
      //     data: 'Аккаунт удален',
      //   });
      // }
      req.body = {
        ...req.body,
        access: true,
        role: result.role,
        id: user.id,
        // user: user.toJSON(),
      };

      return next();
    } catch (e) {
      console.log(e);
      req.body = { ...req.body, access: false };
      return next();
    }
  }
}
