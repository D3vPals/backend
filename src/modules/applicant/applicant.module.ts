import { Module } from '@nestjs/common';
import { ApplicantController } from './applicant.controller';
import { ApplicantService } from './applicant.service';
import { EmailModule } from '../email/email.module';
import { AuthModule } from '../auth/auth.module'; 

@Module({
  imports: [EmailModule, AuthModule],
  controllers: [ApplicantController],
  providers: [ApplicantService]
})
export class ApplicantModule {}
