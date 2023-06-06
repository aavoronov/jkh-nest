import { Injectable } from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import * as bcrypt from 'bcrypt';
import * as Color from 'color';
import fetch from 'cross-fetch';
import { writeFile } from 'fs';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { Base64 } from 'js-base64';
import * as jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import {
  IEmailRegister,
  IEmailUpdatePassword,
} from '../mailer/interfaces/email.body';
import { MailerService } from '../mailer/mailer.service';
import { checkEmail, checkPhone } from '../utils/functions';
import { PhoneVerifications } from '../verifications/entities/phone-verification.entity';
import { Verifications } from '../verifications/entities/verification.entity';
import {
  CreateUserByEmailDto,
  CreateUserByPhoneDto,
} from './dto/create-user.dto';
import { CreateWorkerProfileDto } from './dto/create-worker-profile.dto';
import { RestorePasswordDto } from './dto/restore.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { Profile } from './entities/profile.entity';
import { User } from './entities/user.entity';
import { WorkerProfile } from './entities/worker-profile.entity';
import { CheckPassword } from './interfaces/user.interface';

const length = 8;
const numbers = /[0-9]/g;
const upperCaseLetters = /[A-Z]/g;
const upperLetters = /[a-z]/g;

const mailerService = new MailerService();

@Injectable()
export class UsersService {
  private async uploadFile(file: Express.Multer.File): Promise<string> {
    try {
      // // console.log(file);

      const fileName = Base64.encodeURI(
        (Math.random() * 1000).toString() + Date.now(),
      );
      const dbFileName =
        fileName + file.originalname.slice(file.originalname.lastIndexOf('.'));

      const buffer = file.buffer;

      writeFile(`./uploads/workers/${dbFileName}`, buffer, (err) => {
        // console.log(err);
      });

      return dbFileName;
    } catch (e) {
      // console.log(e);
    }
  }

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

  async signUp(user: CreateUserByEmailDto) {
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
      return { status: StatusCodes.CREATED, text: 'success' };
    } catch (e) {
      throw new HttpException(e.message, e.status, {
        cause: new Error('Some Error'),
      });
    }
  }

  async signUpByPhone(user: CreateUserByPhoneDto) {
    const { phone } = user;
    const newUser = await User.create({
      phone: phone,
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
    }

    // return { email: newUser.email };
    return { status: StatusCodes.CREATED, text: 'success' };
  }

  async authorizeByEmail(userData: UserDto) {
    const { email, password } = userData;
    // // console.log(email, password);

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
        attributes: [
          'email',
          'password',
          'phone',
          'role',
          'isDeleted',
          'isBlocked',
        ],
        include: [
          { model: Verifications, attributes: ['token'] },
          { model: WorkerProfile, attributes: ['isResolved'] },
        ],
      });

      let passwordMatches = false;

      if (user && user.isDeleted) {
        throw new HttpException('Аккаунт удален', StatusCodes.FORBIDDEN, {
          cause: new Error('Some Error'),
        });
      }

      if (user && user.isBlocked) {
        throw new HttpException('Аккаунт заблокирован', StatusCodes.FORBIDDEN, {
          cause: new Error('Some Error'),
        });
      }

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
        // // console.log('verification exists');
      }

      if (user.role === 'admin') {
        throw new HttpException(
          'Нет доступа к публичной части',
          StatusCodes.FORBIDDEN,
          {
            cause: new Error('Some Error'),
          },
        );
      }

      if (user.role !== 'user' && !user.workerProfile.isResolved) {
        throw new HttpException(
          'Ваша учетная запись еще не одобрена администратором. Пожалуйста, ожидайте email',
          StatusCodes.FORBIDDEN,
          {
            cause: new Error('Some Error'),
          },
        );
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

  async createPhoneVerification(body: { phone: string }) {
    try {
      const { phone } = body;

      if (!phone)
        throw new HttpException('Телефон не введен', StatusCodes.BAD_REQUEST, {
          cause: new Error('Some Error'),
        });

      if (!checkPhone(phone).correct)
        throw new HttpException(
          'Некорректный формат номера телефона',
          StatusCodes.BAD_REQUEST,
          {
            cause: new Error('Some Error'),
          },
        );

      const phoneSanitized = checkPhone(phone).result;

      const existingUser = await User.findOne({
        where: { phone: phone },
      });

      // if (!existingUser) {
      //   this.signUpByPhone({ phone: phone });
      //   // console.log('created');
      // } else {
      //   // console.log('existed');
      // }

      if (!existingUser) {
        throw new HttpException(
          'Пользователь не найден',
          StatusCodes.BAD_REQUEST,
          {
            cause: new Error('Some Error'),
          },
        );
      }

      const user = await User.findOne({
        where: { phone: phone },
      });

      if (user && user.isDeleted) {
        throw new HttpException('Аккаунт удален', StatusCodes.FORBIDDEN, {
          cause: new Error('Some Error'),
        });
      }

      if (user && user.isBlocked) {
        throw new HttpException('Аккаунт заблокирован', StatusCodes.FORBIDDEN, {
          cause: new Error('Some Error'),
        });
      }

      await PhoneVerifications.destroy({ where: { userId: user.id } });

      const otp = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0');

      // console.log('otp', otp);

      const verification = await PhoneVerifications.create({
        userId: user.id,
        otp: otp,
      });

      const fetchData = async () => {
        const res = await fetch(
          `https://${process.env.SMSAERO_EMAIL}:${process.env.SMSAERO_TOKEN}@gate.smsaero.ru/v2/auth`,
          // `https://${process.env.SMSAERO_EMAIL}:${process.env.SMSAERO_TOKEN}@gate.smsaero.ru/v2/sms/send?number=${phoneSanitized}&text=ЖКХ+Консьерж+-+код+авторизации+${verification.otp}&sign=SMS Aero`,
        );
        return res;
      };

      const status = (await fetchData()).status;

      // console.log('status', status);

      if (status !== 200) {
        throw new HttpException('Ошибка SMS-сервиса', StatusCodes.BAD_GATEWAY, {
          cause: new Error('Some Error'),
        });
      }

      return { otp: verification.otp };

      // fetch(
      //   `https://${process.env.SMSAERO_EMAIL}:${process.env.SMSAERO_TOKEN}@gate.smsaero.ru/v2/sms/send?number=${phoneSanitized}&text=ЖКХ+Консьерж+-+код+авторизации+${verification.otp}&sign=SMS Aero`,
      // ).then(
      //   (res) => {
      //     return { otp: verification.otp };
      //   },
      //   (error) =>  console.log('error', error),
      // );
    } catch (e) {
      // console.log('e', e);
      throw new HttpException(e.message, e.status, {
        cause: new Error('Some Error'),
      });
    }
  }

  async authorizeByPhone(body: { phone: string; otp: string }) {
    // // console.log(email, password);
    const { phone, otp } = body;
    // console.log(phone);

    try {
      // let passwordMatches = false;

      if (otp.length < 4) {
        throw new HttpException('Введите код доступа', StatusCodes.FORBIDDEN, {
          cause: new Error('Some Error'),
        });
      }

      const user = await User.findOne({
        where: { phone: phone },
        attributes: [
          'id',
          'email',
          'phone',
          'role',
          'isDeleted',
          'isBlocked',
          'password',
        ],
        include: [
          { model: Verifications, attributes: ['token'] },
          { model: WorkerProfile, attributes: ['isResolved'] },
        ],
      });

      if (user && user.isDeleted) {
        throw new HttpException('Аккаунт удален', StatusCodes.FORBIDDEN, {
          cause: new Error('Some Error'),
        });
      }

      if (user && user.isBlocked) {
        throw new HttpException('Аккаунт заблокирован', StatusCodes.FORBIDDEN, {
          cause: new Error('Some Error'),
        });
      }

      if (user.role === 'admin') {
        throw new HttpException(
          'Нет доступа к публичной части',
          StatusCodes.FORBIDDEN,
          {
            cause: new Error('Some Error'),
          },
        );
      }

      if (user.role !== 'user' && !user.workerProfile?.isResolved) {
        throw new HttpException(
          'Ваша учетная запись еще не одобрена администратором. Пожалуйста, ожидайте email',
          StatusCodes.FORBIDDEN,
          {
            cause: new Error('Some Error'),
          },
        );
      }

      const verification = await PhoneVerifications.findOne({
        where: {
          userId: user.id,
          createdAt: { [Op.gt]: new Date(Date.now() - 5 * 60 * 1000) },
          //5 minutes otp lifetime
        },
      });

      if (!verification) {
        throw new HttpException(
          'Код доступа истек. Запросите новый',
          StatusCodes.FORBIDDEN,
          {
            cause: new Error('Some Error'),
          },
        );
      }

      // // console.log('otp', verification.otp);

      if (otp && otp !== verification.otp) {
        throw new HttpException('Неверный код доступа', StatusCodes.FORBIDDEN, {
          cause: new Error('Some Error'),
        });
      }

      const accessToken = jwt.sign(user.toJSON(), process.env.JWT, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      const fieldsRequired = !user.email || !user.password;
      // console.log('fieldsRequired', fieldsRequired);

      return {
        status: StatusCodes.OK,
        message: ReasonPhrases.OK,
        token: accessToken,
        user: { role: user.role, fieldsRequired: fieldsRequired },
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
        // console.log(user.id);
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
      if (!user) {
        throw new HttpException(
          'Аккаунт не существует',
          StatusCodes.NOT_FOUND,
          {
            cause: new Error('Some Error'),
          },
        );
      }
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
      //     // console.log(decoded);
      //     // return decoded;
      //     // return { email: decoded.email };
      //   },
      // );
      const result = await jwt.verify(token, process.env.JWT);

      // console.log(result);
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
      return { email: result.email, phone: result.phone, role: result.role };
      // // console.log(result);
    } catch (e) {
      throw new HttpException(e.message, StatusCodes.FORBIDDEN, {
        cause: new Error('Some Error'),
      });
    }
  }

  async getProfile(req: any) {
    try {
      const token = await req.headers.authorization;
      const result = await jwt.verify(token, process.env.JWT);
      // console.log(result);
      if (!!result.message) {
        throw new HttpException(
          'Сессия истекла или недействительна',
          StatusCodes.FORBIDDEN,
          {
            cause: new Error('Some Error'),
          },
        );
      }

      let userProfile;

      if (result.role === 'user') {
        userProfile = await User.findOne({
          where: { email: result.email },
          attributes: ['email'],
          include: { model: Profile, as: 'profile' },
        });
      } else {
        userProfile = await User.findOne({
          where: { email: result.email },
          attributes: ['email', 'phone'],
          include: {
            model: WorkerProfile,
            as: 'workerProfile',
            attributes: ['name', 'color', 'profilePic', 'address', 'balance'],
          },
        });
      }
      // userProfile.profile.email = result.email;
      // // console.log(userProfile);
      return result.role === 'user' ? userProfile.profile : userProfile;
    } catch (e) {
      throw new HttpException(e.message, StatusCodes.FORBIDDEN, {
        cause: new Error('Some Error'),
      });
    }
  }

  async update(req: any, updateData: UpdateUserDto) {
    try {
      // console.log(updateData);
      const token = await req.headers.authorization;

      const result = await jwt.verify(token, process.env.JWT);
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

      // console.log(result);

      if (!!updateData.newPassword) {
        if (!!user.password) {
          const passwordIsValid = UsersService.validPassword(
            updateData.oldPassword,
            user.password,
          );
          if (!passwordIsValid) {
            throw new HttpException(
              'Текущий пароль введен неправильно',
              StatusCodes.FORBIDDEN,
              {
                cause: new Error('Some Error'),
              },
            );
          }
        }
        const salt = bcrypt.genSaltSync();
        const passwordHash = await bcrypt.hash(updateData.newPassword, salt);
        await user.update({ password: passwordHash });
      }

      if (!updateData.pseudonym) {
        throw new HttpException(
          'Псевдоним не может быть пустым',
          StatusCodes.BAD_REQUEST,
          {
            cause: new Error('Some Error'),
          },
        );
      }
      let profile;

      if (result.role === 'user') {
        profile = await Profile.findOne({ where: { userId: user.id } });
        await profile.update({
          pseudonym: updateData.pseudonym,
          profilePic: updateData.filename ?? null,
        });
      } else {
        profile = await WorkerProfile.findOne({ where: { userId: user.id } });
        await profile.update({
          name: updateData.pseudonym,
          profilePic: updateData.filename ?? null,
        });
      }

      // profilePic: filename

      return profile;
    } catch (e) {
      throw new HttpException(e.message, StatusCodes.FORBIDDEN, {
        cause: new Error('Some Error'),
      });
    }
  }

  async updateEmail(req: any, updateData: UpdateEmailDto) {
    try {
      const token = await req.headers.authorization;
      // console.log(token);

      const result = await jwt.verify(token, process.env.JWT);
      // console.log(updateData);
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

      // // console.log('user', user);

      const passwordIsValid = UsersService.validPassword(
        updateData.password,
        user.password,
      );
      if (!passwordIsValid) {
        throw new HttpException(
          'Текущий пароль введен неправильно',
          StatusCodes.FORBIDDEN,
          {
            cause: new Error('Some Error'),
          },
        );
      }

      if (!checkEmail(updateData.email).correct) {
        // console.log('incorrect');
        throw new HttpException(
          'Вы некорректно ввели адрес электронной почты',
          StatusCodes.CONFLICT,
          {
            cause: new Error('Some Error'),
          },
        );
      }

      if (user.email === updateData.email) {
        throw new HttpException(
          'Новая почта не должна совпадать со старой',
          StatusCodes.CONFLICT,
          {
            cause: new Error('Some Error'),
          },
        );
      }

      const userWithProvidedEmail = await User.findOne({
        where: { email: updateData.email },
      });
      if (!!userWithProvidedEmail) {
        throw new HttpException('Почта уже занята', StatusCodes.CONFLICT, {
          cause: new Error('Some Error'),
        });
      }

      const newVerification = await Verifications.create({ userId: user.id });
      if (user.email) {
        user.update({ email: updateData.email });
        const mailBody: IEmailRegister = {
          email: updateData.email,
          verification: newVerification.token,
        };

        await mailerService.changeEmailConfirmation(mailBody);
      }

      return { status: StatusCodes.OK, text: 'success' };
    } catch (e) {
      throw new HttpException(e.message, StatusCodes.FORBIDDEN, {
        cause: new Error('Some Error'),
      });
    }
  }

  async updatePhone(req: any, updateData: { phone: string; password: string }) {
    try {
      const token = await req.headers.authorization;
      // console.log(token);

      const result = await jwt.verify(token, process.env.JWT);
      // console.log(updateData);
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

      // // console.log('user', user);

      const passwordIsValid = UsersService.validPassword(
        updateData.password,
        user.password,
      );
      if (!passwordIsValid) {
        throw new HttpException(
          'Текущий пароль введен неправильно',
          StatusCodes.FORBIDDEN,
          {
            cause: new Error('Some Error'),
          },
        );
      }

      if (!checkPhone(updateData.phone).correct) {
        // console.log('incorrect');
        throw new HttpException(
          'Некорректный формат номера телефона',
          StatusCodes.CONFLICT,
          {
            cause: new Error('Some Error'),
          },
        );
      }

      if (user.phone === updateData.phone) {
        throw new HttpException(
          'Новый номер телефона не должен совпадать со старым',
          StatusCodes.CONFLICT,
          {
            cause: new Error('Some Error'),
          },
        );
      }

      const userWithProvidedPhone = await User.findOne({
        where: { phone: updateData.phone },
      });
      if (!!userWithProvidedPhone) {
        throw new HttpException(
          'Номер телефона уже занят',
          StatusCodes.CONFLICT,
          {
            cause: new Error('Some Error'),
          },
        );
      }

      await user.update({ phone: updateData.phone });

      return { status: StatusCodes.OK, text: 'success' };
    } catch (e) {
      throw new HttpException(e.message, StatusCodes.FORBIDDEN, {
        cause: new Error('Some Error'),
      });
    }
  }

  async delete(req: any) {
    try {
      const token = await req.headers.authorization;

      const result = await jwt.verify(token, process.env.JWT);
      if (!!result.message) {
        throw new HttpException(
          'Сессия истекла или недействительна',
          StatusCodes.FORBIDDEN,
          {
            cause: new Error('Some Error'),
          },
        );
      }

      // console.log(result.email);
      const user = await User.findOne({ where: { email: result.email } });
      await user.update({ isDeleted: true });

      return { status: StatusCodes.OK, text: 'success' };
    } catch (e) {
      throw new HttpException(e.message, StatusCodes.FORBIDDEN, {
        cause: new Error('Some Error'),
      });
    }
  }

  async createWorkerApplication(
    createWorkerProfileDto: CreateWorkerProfileDto,
    files: {
      inn: Express.Multer.File;
    },
  ) {
    const {
      name,
      email,
      phone,
      type,
      // riasToken,
      latitude,
      longitude,
      address,
    } = createWorkerProfileDto;
    let dbType;

    switch (type) {
      case 'Для УК, ТСЖ':
        dbType = 'uk';
        break;

      case 'Для Управляющего по дому':
        dbType = 'upravdom';
        break;

      case 'Для рекламодателей':
        dbType = 'admakers';
        break;

      case 'Для магазинов':
        dbType = 'stores';
        break;

      case 'Для представителей бизнеса':
        dbType = 'business';
        break;
    }

    try {
      const existingApplication = await User.findOne({
        where: {
          [Op.or]: [{ email: email }, { phone: phone }],
        },
      });
      if (!!existingApplication)
        if (existingApplication.role === 'user') {
          throw new HttpException(
            'Пользователь с указанными данными уже существует',
            StatusCodes.CONFLICT,
            {
              cause: new Error('Some Error'),
            },
          );
        } else {
          throw new HttpException(
            'Заявка с указанными телефоном и/или почтой уже была подана. Ожидайте одобрения',
            StatusCodes.CONFLICT,
            {
              cause: new Error('Some Error'),
            },
          );
        }

      // if (!!riasToken) {
      //   const checkTokenExistence = await WorkerProfile.findOne({
      //     where: {
      //       riasToken: riasToken,
      //     },
      //   });

      //   if (!!checkTokenExistence) {
      //     throw new HttpException(
      //       'Указанный токен РИАС ЖКХ уже используется',
      //       StatusCodes.CONFLICT,
      //       {
      //         cause: new Error('Some Error'),
      //       },
      //     );
      //   }
      // }

      const re = /^\S+@\S+\.\S+$/;
      if (phone.includes('_')) {
        throw new HttpException(
          'Поле телефона заполнено не полностью',
          StatusCodes.BAD_REQUEST,
          {
            cause: new Error('Some Error'),
          },
        );
      }
      if (!re.test(email)) {
        throw new HttpException(
          'Почта введена некорректно',
          StatusCodes.BAD_REQUEST,
          {
            cause: new Error('Some Error'),
          },
        );
      }

      const docs: Partial<{
        inn: string;
      }> = {};
      for (const item in files) {
        const dbName = await this.uploadFile(files[item][0]);
        Object.assign(docs, { [item]: dbName });
      }
      const { inn } = docs;

      // const newApplication = await WorkerProfile.create({
      //   name,
      //   email,
      //   phone,
      //   type,
      //   inn,
      // });

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

      const newApplication = await User.create({
        email,
        phone,
        password: 'no-access',
        role: dbType,
      });

      const newProfile = await WorkerProfile.create({
        userId: newApplication.id,
        inn,
        name,
        // riasToken: riasToken ?? null,
        address: address,
        point: { type: 'Point', coordinates: [longitude, latitude] },
        //flipped
        color: pastelColor.hex(),
      });

      if (!newApplication || !newProfile) {
        throw new HttpException(
          'Ошибка сервера. Пожалуйста, повторите попытку позже',
          StatusCodes.BAD_GATEWAY,
          {
            cause: new Error('Some Error'),
          },
        );
      }
      await newProfile.reload();

      // await this.approveWorkerOrResetTheirPassword(newApplication.id);
      await mailerService.newWorkerApplication(newProfile.id);
      return { status: StatusCodes.OK, text: 'success' };
    } catch (e) {
      throw new HttpException(e.message, StatusCodes.FORBIDDEN, {
        cause: new Error('Some Error'),
      });
    }
  }

  async approveWorkerOrResetTheirPassword(id: number) {
    // if token.role === 'admin'
    try {
      // console.log(id);
      const worker = await User.findOne({
        where: { id },
        include: { model: WorkerProfile, as: 'workerProfile' },
      });

      const salt = bcrypt.genSaltSync();
      const randomPassword = Math.random().toString(36).slice(-10);
      const randomPasswordCrypt = bcrypt.hashSync(randomPassword, salt);

      // console.log(randomPassword);

      await worker.update({ password: randomPasswordCrypt });
      await WorkerProfile.update(
        { isResolved: true },
        { where: { userId: id } },
      );

      const bodyEmail: IEmailUpdatePassword = {
        password: randomPassword,
        email: worker.email,
      };
      await mailerService.approvedWorkerCredentialsEmail(bodyEmail);
      return 'ok';
    } catch (e) {
      // console.log(e);
    }
  }
}
