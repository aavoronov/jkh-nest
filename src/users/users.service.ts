import { Injectable, BadRequestException } from '@nestjs/common';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ProfileDto } from './dto/profile.dto';
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import * as bcrypt from 'bcrypt';
import { CheckPassword } from './interfaces/user.interface';
import { checkEmail } from '../utils/functions';
import { Verifications } from '../verifications/entities/verification.entity';
import { UserDto } from './dto/user.dto';
import * as jwt from 'jsonwebtoken';
import { MailerService } from '../mailer/mailer.service';
import {
  IEmailRegister,
  IEmailUpdatePassword,
} from '../mailer/interfaces/email.body';
import { RestorePasswordDto } from './dto/restore.dto';
import * as Color from 'color';

const length = 8;
const numbers = /[0-9]/g;
const upperCaseLetters = /[A-Z]/g;
const upperLetters = /[a-z]/g;

const mailerService = new MailerService();

@Injectable()
export class UsersService {
  private static validPassword(password: string, userPassword: string) {
    return bcrypt.compareSync(password, userPassword);
  }

  private static getRandomInt = (max: number): number => {
    return Math.floor(Math.random() * max);
  };

  private checkPassword = (value: string): CheckPassword => {
    if (
      !value.match(upperLetters) ||
      !value.match(upperCaseLetters) ||
      !value.match(numbers)
    )
      return {
        status: false,
        message:
          'Пароль должен содержать заглавную букву, строчную букву и цифры.',
      };

    if (!(value.length >= length))
      return {
        status: false,
        message: 'Минимальное количество символов пароля — 8.',
      };
    return { status: true, message: '' };
  };

  async create(user: CreateUserDto) {
    try {
      const { email, password, passwordConfirmation } = user;

      if (!checkEmail(email).correct)
        throw new HttpException(
          'Вы некорректно ввели адрес электронной почты',
          StatusCodes.CONFLICT,
          {
            cause: new Error('Some Error'),
          },
        );

      if (!!(await User.findOne({ where: { email: email } }))) {
        throw new HttpException(
          'Пользователь с таким email уже существует',
          StatusCodes.CONFLICT,
          {
            cause: new Error('Some Error'),
          },
        );
      }
      if (password !== passwordConfirmation) {
        throw new HttpException(
          'Пароль и подтверждение пароля не совпадают',
          StatusCodes.BAD_REQUEST,
          {
            cause: new Error('Some Error'),
          },
        );
      }
      if (!this.checkPassword(password).status) {
        throw new HttpException(
          this.checkPassword(password).message,
          StatusCodes.BAD_REQUEST,
          {
            cause: new Error('Some Error'),
          },
        );
      }

      const salt = bcrypt.genSaltSync();
      const passwordHash = await bcrypt.hash(password, salt);

      const newUser = await User.create({
        email,
        password: passwordHash,
        phone: null,
      });
      if (newUser) {
        let randomColor: Color, pastelColor: Color, contrast: number;
        while (1) {
          randomColor = Color.rgb(
            UsersService.getRandomInt(255),
            UsersService.getRandomInt(255),
            UsersService.getRandomInt(255),
          );
          pastelColor = randomColor.saturate(0.5).mix(Color('white'), 0.2);
          contrast = pastelColor.contrast(Color('white'));
          if (contrast > 2) break;
        }

        await Profile.create({ userId: newUser.id, color: pastelColor.hex() });

        const { token } = await Verifications.create({ userId: newUser.id });
        if (user.email) {
          const mailBody: IEmailRegister = {
            email: user.email,
            verification: token,
          };

          await mailerService.sendMailRegister(mailBody);
        }
      }

      // return { email: newUser.email };
      return {};
    } catch (e) {
      throw new HttpException(e.message, e.status, {
        cause: new Error('Some Error'),
      });
    }
  }

  async authorizeByEmail(userData: UserDto) {
    const { email, password } = userData;
    // console.log(email, password);

    try {
      if (!email)
        throw new HttpException('Почта не введена', StatusCodes.BAD_REQUEST, {
          cause: new Error('Some Error'),
        });
      if (!password)
        throw new HttpException('Пароль не введен', StatusCodes.BAD_REQUEST, {
          cause: new Error('Some Error'),
        });

      if (!checkEmail(email).correct)
        throw new HttpException(
          'Вы некорректно ввели адрес электронной почты',
          StatusCodes.BAD_REQUEST,
          {
            cause: new Error('Some Error'),
          },
        );

      const user = await User.findOne({
        where: { email: email },
        attributes: ['email', 'password', 'role'],
        include: { model: Verifications, attributes: ['token'] },
      });

      let passwordMatches = false;

      if (user)
        passwordMatches = UsersService.validPassword(password, user.password);

      if (!user || !passwordMatches) {
        throw new HttpException(
          'Неправильный логин или пароль',
          StatusCodes.NOT_FOUND,
          {
            cause: new Error('Some Error'),
          },
        );
      }

      // if (!user.verification?.token) {
      if (!!user.verification?.token) {
        throw new HttpException(
          'Вы не подтвердили аккаунт. Проверьте свою почту.',
          StatusCodes.FORBIDDEN,
          {
            cause: new Error('Some Error'),
          },
        );
        // console.log('verification exists');
      }

      const accessToken = jwt.sign(user.toJSON(), process.env.JWT, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      return {
        status: StatusCodes.OK,
        message: ReasonPhrases.OK,
        token: accessToken,
        user: { email: user.email, role: user.role },
      };
    } catch (e) {
      throw new HttpException(e.message, e.status, {
        cause: new Error('Some Error'),
      });
    }
  }

  async confirmEmail(verification: string) {
    try {
      const user = await Verifications.findOne({
        where: { token: verification },
        // include: { model: User, attributes: ['id', 'email'] },
      });

      if (!user) {
        throw new HttpException(
          'Аккаунт уже подтвержден или не существует',
          StatusCodes.NOT_ACCEPTABLE,
          {
            cause: new Error('Some Error'),
          },
        );
      }

      {
        await Verifications.destroy({ where: { userId: user.userId } });
        console.log(user.id);
        // return {
        //   status: StatusCodes.OK,
        //   message: ReasonPhrases.OK,
        // };
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Подтверждение аккаунта на ЖКХ Консьерж</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">

        </head>
        <body>
        <div style="width: 100%; display: flex; align-items: center; margin-top: 10%; flex-direction: column"><span style="font-family: Roboto; text-align: center">Подтверждение почты прошло успешно. Вы можете закрыть эту страницу или нажать кнопку ниже, чтобы перейти на главную.</span>
        <a href="${process.env.CLIENT_URL}" style="background-color: #ff8c00; border-radius: 5px; padding: 16px 30px; color: #ffffff; margin-top: 10%; width: 200px; text-align: center; font-family: Roboto; text-decoration: none">Перейти на главную</a>
        </div>
        </body>
        </html>`;
      }
    } catch (e) {
      throw new HttpException(e.message, e.status, {
        cause: new Error('Some Error'),
      });
    }
  }

  async restore(data: RestorePasswordDto) {
    try {
      if (!data.email) {
        throw new HttpException('Введите почту', StatusCodes.BAD_REQUEST, {
          cause: new Error('Some Error'),
        });
      }
      const user: User = await User.findOne({
        where: {
          email: data.email,
        },
      });
      if (user) {
        const salt = bcrypt.genSaltSync();
        const randomPassword = Math.random().toString(36).slice(-8);
        const randomPasswordCrypt = bcrypt.hashSync(randomPassword, salt);

        await User.update(
          {
            password: randomPasswordCrypt,
          },
          { where: { id: user.id } },
        );
        const response = {
          status: StatusCodes.OK,
          message: ReasonPhrases.OK,
        };
        const bodyEmail: IEmailUpdatePassword = {
          password: randomPassword,
          email: user.email,
        };
        await mailerService.restorePasswordMail(bodyEmail);
        return response;
      } else {
        throw new HttpException(
          'Аккаунт не существует',
          StatusCodes.NOT_FOUND,
          {
            cause: new Error('Some Error'),
          },
        );
      }
    } catch (e) {
      throw new HttpException(e.message, e.status, {
        cause: new Error('Some Error'),
      });
    }
  }

  async reauthorize(req) {
    try {
      const token = await req.headers.authorization;

      // const result = await jwt.verify(
      //   token,
      //   process.env.JWT,
      //   function (e, decoded) {
      //     if (e) {
      //       throw new HttpException(e.message, StatusCodes.FORBIDDEN, {
      //         cause: new Error('Some Error'),
      //       });
      //     }
      //     console.log(decoded);
      //     // return decoded;
      //     // return { email: decoded.email };
      //   },
      // );
      const result = await jwt.verify(token, process.env.JWT);

      console.log(result);
      if (!!result.message) {
        throw new HttpException(
          'Сессия истекла или недействительна',
          StatusCodes.FORBIDDEN,
          {
            cause: new Error('Some Error'),
          },
        );
      }
      const user = await User.findOne({ where: { email: result.email } });
      if (!user) {
        throw new HttpException(
          'Пользователь не существует',
          StatusCodes.UNAUTHORIZED,
          {
            cause: new Error('Some Error'),
          },
        );
      }
      return { email: result.email, role: result.role };
      // console.log(result);
    } catch (e) {
      throw new HttpException(e.message, StatusCodes.FORBIDDEN, {
        cause: new Error('Some Error'),
      });
    }
  }

  async getProfile(req) {
    try {
      const token = await req.headers.authorization;
      const result = await jwt.verify(token, process.env.JWT);
      console.log(result);
      if (!!result.message) {
        throw new HttpException(
          'Сессия истекла или недействительна',
          StatusCodes.FORBIDDEN,
          {
            cause: new Error('Some Error'),
          },
        );
      }
      const userProfile = await User.findOne({
        where: { email: result.email },
        attributes: ['email'],
        include: { model: Profile, as: 'profile' },
      });
      // userProfile.profile.email = result.email;
      // console.log(userProfile);
      return userProfile.profile;
    } catch (e) {
      throw new HttpException(e.message, StatusCodes.FORBIDDEN, {
        cause: new Error('Some Error'),
      });
    }
  }

  async update(req, updateData: UpdateUserDto) {
    try {
      const token = await req.headers.authorization;

      const result = await jwt.verify(token, process.env.JWT);
      console.log(updateData);
      if (!!result.message) {
        throw new HttpException(
          'Сессия истекла или недействительна',
          StatusCodes.FORBIDDEN,
          {
            cause: new Error('Some Error'),
          },
        );
      }
      const user = await User.findOne({ where: { email: result.email } });

      const profile = await Profile.findOne({ where: { userId: user.id } });
      await profile.update({ pseudonym: updateData.pseudonym });
      return profile;
    } catch (e) {
      throw new HttpException(e.message, StatusCodes.FORBIDDEN, {
        cause: new Error('Some Error'),
      });
    }
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
