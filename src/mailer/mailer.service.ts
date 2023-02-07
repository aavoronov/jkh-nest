import { Injectable, BadGatewayException } from '@nestjs/common';
import { IEmailRegister, IEmailUpdatePassword } from './interfaces/email.body';
import { HttpException } from '@nestjs/common';

import { createTransport } from 'nodemailer';

const user = process.env.MAILER_USER;
const pass = process.env.MAILER_PASSWORD;

const transporter = createTransport({
  host: 'smtp.yandex.ru',
  port: 465,
  //   service: "mail",
  secure: true,
  auth: {
    user: user + '@yandex.ru',
    pass: pass,
  },
});

@Injectable()
export class MailerService {
  // async sendAccountData(body) {
  //   try {
  //     const output = `
  //           <p>Имя: ${body.firstname} ${body.lastname}</p>
  //           <p>Логин: ${body.username}</p>
  //           <p>Пароль: ${body.password}</p>
  //       `;

  //     const mailOptions = {
  //       from: `Chinup <chinup.online@yandex.ru>`,
  //       to: body.email,
  //       subject: 'Данные нового аккаунта Chinup',
  //       html: output,
  //     };

  //     await transporter.sendMail(mailOptions);
  //   } catch (error) {
  //     throw new BadGatewayException(error);
  //   }
  // }

  async sendMailRegister(body: IEmailRegister) {
    try {
      const output = `
           
            <p>Аккаунт зарегистрирован. <a href="${process.env.MAILER_URL}/users/confirm?key=${body.verification}">Нажмите, чтобы подтвердить ваш аккаунт.</a></p>
            
        `;
      const mailOptions = {
        from: `ЖКХ Консьерж <${user}@yandex.ru>`,
        to: body.email,
        subject: 'Данные нового аккаунта ЖКХ Консьерж',
        html: output,
      };
      await transporter.sendMail(mailOptions);
    } catch (e) {
      throw new HttpException(e.message, e.status, {
        cause: new Error('Some Error'),
      });
    }
  }

  async restorePasswordMail(body: IEmailUpdatePassword) {
    try {
      const output = `
            <p>Пароль к аккаунту сброшен.</p>
            <p>Новый пароль: ${body.password}</p>
            <p>Рекомендуем сменить его на более надежный.</p>
        `;
      const mailOptions = {
        from: `ЖКХ Консьерж <${user}@yandex.ru>`,
        to: body.email,
        subject: 'Новый пароль к аккаунту',
        html: output,
      };

      await transporter.sendMail(mailOptions);
    } catch (e) {
      throw new HttpException(e.message, e.status, {
        cause: new Error('Some Error'),
      });
    }
  }
}
