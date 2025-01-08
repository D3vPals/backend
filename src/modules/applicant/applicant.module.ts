import { Module } from '@nestjs/common';
import { ApplicantController } from './applicant.controller';
import { ApplicantService } from './applicant.service';
import { EmailModule } from '../email/email.module';
import { AuthModule } from '../auth/auth.module'; 
import { ProjectModule } from '../project/project.module'

@Module({
  imports: [EmailModule, AuthModule, ProjectModule],
  controllers: [ApplicantController],
  providers: [ApplicantService]
})
export class ApplicantModule {}
