import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');
  private readonly logFilePath = path.join('/var/log', 'your-app.log'); // 로그 파일 경로

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;

    res.on('finish', () => {
      const { statusCode } = res;
      const logMessage = `${method} ${originalUrl} ${statusCode}`;

      // 파일에 기록
      fs.appendFileSync(this.logFilePath, `[${new Date().toISOString()}] ${logMessage}\n`);

      // 콘솔에 출력
      this.logger.log(logMessage);
    });

    next();
  }
}
