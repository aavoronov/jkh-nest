import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { SocketIOAdapter } from './socket-io-adapter';
import { readFileSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    // httpsOptions: {
    //   key: readFileSync(`${process.env.LETSENCRYPT_DIR}/privkey.pem`),
    //   cert: readFileSync(`${process.env.LETSENCRYPT_DIR}/cert.pem`),
    //   ca: readFileSync(`${process.env.LETSENCRYPT_DIR}/chain.pem`),
    //   requestCert: false,
    //   rejectUnauthorized: false,
    // },
  });
  app.setGlobalPrefix('api/v1');
  const configService = app.get(ConfigService);
  app.useWebSocketAdapter(new SocketIOAdapter(app, configService));
  const config = new DocumentBuilder()
    .setTitle('test')
    .setDescription(`The API description`)
    .setVersion('1.0s')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  // admin-bro @admin-bro/nestjs @admin-bro/express express-formidable @admin-bro/sequelize

  SwaggerModule.setup('swagger', app, document);

  await app.listen(5000);
}
bootstrap();
