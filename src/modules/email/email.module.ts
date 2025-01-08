import { Module } from '@nestjs/common';
import { EmailService } from './email.service';

@Module({
  providers: [EmailService],
  exports: [EmailService], // 외부에서 사용할 수 있도록 export
})
export class EmailModule {}
