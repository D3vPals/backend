import * as fs from 'fs';
import * as path from 'path';
import { Logger, LoggerService, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import { LoggingMiddleware } from './modules/test/logging.middleware';
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

  // LoggingMiddleware를 전역 적용
  app.use(new LoggingMiddleware().use);

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

  app.enableCors({
    origin: ['http://localhost:3000', `http://localhost:5173`],
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

  // 서버 실행!
  const port = process.env.PORT;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
