import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from '@/common/exception/response.interceptor';
import { GlobalExceptionFilter } from '@/common/exception/global.exception';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
  });
  await app.listen(process.env.PORT ?? 3001);
}

bootstrap();
