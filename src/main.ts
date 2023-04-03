import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SocketIOAdapter } from './socket-io-adapter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
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
