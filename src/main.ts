import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { config } from 'dotenv';
config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:3000', `http://localhost:5173`], // 로컬 React 개발 서버 허용(기본 포트 적용 추후 수정 필요!)
    credentials: true, // 인증 정보(쿠키 등) 허용
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.use(bodyParser.json());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('DevPals')
    .setDescription('DevPals API Docs')
    .setVersion('0.1')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        in: 'header',
        name: 'JWT',
      },
      'JWT',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'method',
    },
    customSiteTitle: 'API 문서',
  });

  // 서버 실행
  const port = process.env.PORT;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
