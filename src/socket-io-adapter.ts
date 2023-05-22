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
    // const cors = true;

    let httpsOptions;

    if (process.env.ENV === 'prod') {
      httpsOptions = {
        key: readFileSync(`${process.env.LETSENCRYPT_DIR}/privkey.pem`),
        cert: readFileSync(`${process.env.LETSENCRYPT_DIR}/cert.pem`),
        ca: readFileSync(`${process.env.LETSENCRYPT_DIR}/chain.pem`),

        requestCert: false,
        rejectUnauthorized: false,
      };
      console.log('first', process.env.LETSENCRYPT_DIR);
    }

    // // console.log(`${process.env.CLIENT_URL}:${process.env.CLIENT_PORT}`);
    // ...httpsOptions,

    const optionsWithCORS: ServerOptions = {
      ...options,
      cors,
    };

    return super.createIOServer(port, optionsWithCORS);
  }
}
