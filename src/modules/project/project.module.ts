import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { JwtModule } from '@nestjs/jwt';
import { PositionTagModule } from '../position-tag/position-tag.module';
import { MethodModule } from '../method/method.module';
import { SkillTagModule } from '../skill-tag/skill-tag.module';
import { ApplicantModule } from '../applicant/applicant.module';

@Module({
  controllers: [ProjectController],
  providers: [ProjectService],
  imports: [
    JwtModule,
    PositionTagModule,
    MethodModule,
    SkillTagModule,
    ApplicantModule,
  ],
  exports: [ProjectService],
})
export class ProjectModule {}
