import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ApplicantModule } from '../applicant/applicant.module';

@Module({
  providers: [EmailService],
  exports: [EmailService], // 외부에서 사용할 수 있도록 export
  imports: [ApplicantModule],
})
export class EmailModule {}
