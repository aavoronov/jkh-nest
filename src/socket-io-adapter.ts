import { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { readFileSync } from 'fs';
import { ServerOptions } from 'socket.io';

export class SocketIOAdapter extends IoAdapter {
  constructor(
    private app: INestApplicationContext,
    private configService: ConfigService,
  ) {
    super(app);
  }
  createIOServer(port: number, options?: ServerOptions) {
    const clientPort = parseInt(process.env.CLIENT_PORT);

    const cors = {
      origin: [`${process.env.CLIENT_URL}`],
    };

    const httpsOptions = {
      key: readFileSync(
        '/etc/letsencrypt/live/1203521-cu41329.tw1.ru/privkey.pem',
      ),
      cert: readFileSync(
        '/etc/letsencrypt/live/1203521-cu41329.tw1.ru/cert.pem',
      ),
      ca: readFileSync(
        '/etc/letsencrypt/live/1203521-cu41329.tw1.ru/chain.pem',
      ),

      requestCert: false,
    };
    // rejectUnauthorized: false
    // // console.log(`${process.env.CLIENT_URL}:${process.env.CLIENT_PORT}`);

    const optionsWithCORS: ServerOptions = {
      ...options,
      cors,
      ...httpsOptions,
    };

    return super.createIOServer(port, optionsWithCORS);
  }
}
