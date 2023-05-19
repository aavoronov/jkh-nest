import { HttpException, Injectable } from '@nestjs/common';
import {
  IEmailChatAdApproval,
  IEmailRegister,
  IEmailUpdatePassword,
} from './interfaces/email.body';

import { createTransport } from 'nodemailer';

// const user = process.env.MAILER_USER;
// const pass = process.env.MAILER_PASSWORD;

@Injectable()
export class MailerService {
  // user = process.env.MAILER_USER;
  // pass = process.env.MAILER_PASSWORD;
  // adminUrl = process.env.ADMIN_URL;
  // adminEmail = process.env.ADMIN_EMAIL;
  // mailerUrl = process.env.MAILER_URL;

  user = 'voronov.xcvi';
  pass = 'ogkluftufzovrllc';
  mailerUrl = 'http://api.1203521-cu41329.tw1.ru/';
  adminEmail = 'stinger1221@mail.ru';
  adminUrl = 'http://api.1203521-cu41329.tw1.ru/admin/';

  transporter = createTransport({
    host: 'smtp.yandex.ru',
    port: 465,
    //   service: "mail",
    secure: true,
    auth: {
      user: this.user + '@yandex.ru',
      pass: this.pass,
    },
  });
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
           
            <p>Аккаунт зарегистрирован. <a href="${this.mailerUrl}users/confirm?key=${body.verification}">Нажмите, чтобы подтвердить ваш аккаунт.</a></p>
            
        `;
      const mailOptions = {
        from: `ЖКХ Консьерж <${this.user}@yandex.ru>`,
        to: body.email,
        subject: 'Данные нового аккаунта ЖКХ Консьерж',
        html: output,
      };
      await this.transporter.sendMail(mailOptions);
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
        from: `ЖКХ Консьерж <${this.user}@yandex.ru>`,
        to: body.email,
        subject: 'Новый пароль к аккаунту',
        html: output,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (e) {
      throw new HttpException(e.message, e.status, {
        cause: new Error('Some Error'),
      });
    }
  }

  async changeEmailConfirmation(body: IEmailRegister) {
    try {
      const output = `
          
      <p>Почта вашей учетной записи успешно изменена. <a href="${this.mailerUrl}users/confirm?key=${body.verification}">Нажмите, чтобы подтвердить вашу новую почту.</a></p>
            
        `;
      const mailOptions = {
        from: `ЖКХ Консьерж <${this.user}@yandex.ru>`,
        to: body.email,
        subject: 'Подтверждение новой почты',
        html: output,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (e) {
      throw new HttpException(e.message, e.status, {
        cause: new Error('Some Error'),
      });
    }
  }

  async approvedWorkerCredentialsEmail(body: IEmailUpdatePassword) {
    try {
      const output = `
            <p>Ваш пароль от учетной записи:</p>
            <p>${body.password}</p>
            <p>Рекомендуем сменить его на более надежный.</p>
        `;
      const mailOptions = {
        from: `ЖКХ Консьерж <${this.user}@yandex.ru>`,
        to: body.email,
        subject: 'Ваши данные учетной записи рабочего',
        html: output,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (e) {
      throw new HttpException(e.message, e.status, {
        cause: new Error('Some Error'),
      });
    }
  }

  async newWorkerApplication(id: number) {
    try {
      const output = `
            <p>Поступила новая заявка на регистрацию рабочего аккаунта.</p>
            <p>Просмотреть можно по <a href='${this.adminUrl}resources/WorkerProfiles/records/${id}/show'>ссылке</a> или найти вручную в административной панели.</p>
        `;
      const mailOptions = {
        from: `ЖКХ Консьерж <${this.user}@yandex.ru>`,
        to: this.adminEmail,
        subject: 'Новая заявка рабочего аккаунта',
        html: output,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (e) {
      throw new HttpException(e.message, e.status, {
        cause: new Error('Some Error'),
      });
    }
  }

  async newWorkerObjectApplication(id: number) {
    try {
      const output = `
            <p>Поступила новая заявка на регистрацию объекта под управлением рабочего аккаунта.</p>
            <p>Просмотреть можно по <a href='${this.adminUrl}resources/NewWorkerObjectApplications/records/${id}/show'>ссылке</a> или найти вручную в административной панели.</p>
        `;
      const mailOptions = {
        from: `ЖКХ Консьерж <${this.user}@yandex.ru>`,
        to: this.adminEmail,
        subject: 'Новая заявка объекта рабочего аккаунта',
        html: output,
      };

      // console.log(this.user, this.pass, this.adminUrl);

      await this.transporter.sendMail(mailOptions);
    } catch (e) {
      throw new HttpException(e.message, e.status, {
        cause: new Error('Some Error'),
      });
    }
  }

  async newChatAdApplication(id: number) {
    try {
      const output = `
            <p>Поступила новая заявка на рекламу в домовых чатах.</p>
            <p>Просмотреть можно по <a href='${this.adminUrl}resources/ChatAds/records/${id}/show'>ссылке</a> или найти вручную в административной панели.</p>
        `;
      const mailOptions = {
        from: `ЖКХ Консьерж <${this.user}@yandex.ru>`,
        to: this.adminEmail,
        subject: 'Новая заявка на рекламу в чатах',
        html: output,
      };

      // console.log('sent');

      await this.transporter.sendMail(mailOptions);
    } catch (e) {
      throw new HttpException(e.message, e.status, {
        cause: new Error('Some Error'),
      });
    }
  }

  async notifyOfChatAdApproval(body: IEmailChatAdApproval) {
    try {
      const output = `
            <p>Ваше объявление домового чата</p>
            <p>${body.description}</p>
            <p>одобрено модератором.</p>
        `;
      const mailOptions = {
        from: `ЖКХ Консьерж <${this.user}@yandex.ru>`,
        to: body.email,
        subject: 'Одобрено объявление домового чата',
        html: output,
      };

      // console.log(this.user, this.pass, this.adminUrl);
      await this.transporter.sendMail(mailOptions);
    } catch (e) {
      throw new HttpException(e.message, e.status, {
        cause: new Error('Some Error'),
      });
    }
  }
}
