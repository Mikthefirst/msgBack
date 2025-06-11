import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

const port = process.env.PORT ?? 3001;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Автоматически удаляет лишние поля
      forbidNonWhitelisted: true, // Бросает ошибку при лишних поля
    }),
  ); 

  app.enableCors({
    origin: `${process.env.FRONT_HOST}`,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(port, '0.0.0.0');
  console.log(`sever is listening on port ${port}`);
}
bootstrap();
