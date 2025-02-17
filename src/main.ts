import * as fs from 'fs';
import * as path from 'path';
import { Logger, LoggerService, ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import { config } from 'dotenv';
config();

// 로그 디렉토리 및 파일 생성
const logDir = '/var/log';
const logFile = 'your-app.log';
const logFilePath = path.join(logDir, logFile);

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true }); // 로그 디렉토리가 없으면 생성
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger: LoggerService = new Logger();

  // 기존 로거를 확장해 파일 로그 추가
  logger.log = (message: string) => {
    fs.appendFileSync(logFilePath, `[LOG] ${message}\n`);
    console.log(message); // 콘솔에도 출력
  };

  logger.error = (message: string) => {
    fs.appendFileSync(logFilePath, `[ERROR] ${message}\n`);
    console.error(message);
  };

  app.useLogger(logger); // 앱에 커스터마이징된 로거 적용

  // ✅ 정적 파일 제공 설정 (public 폴더)
  app.use('/public', express.static(path.join(__dirname, '..', 'public')));

  // 환경 변수에서 CORS_ORIGINS 불러오기 및 처리
  const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
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
