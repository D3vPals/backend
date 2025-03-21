import { Module, Logger } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { AuthenticodeModule } from './modules/authenticode/authenticode.module';
import { ProjectModule } from './modules/project/project.module';
import { ApplicantModule } from './modules/applicant/applicant.module';
import { NotificationModule } from './modules/notification/notification.module';
import { SkillTagModule } from './modules/skill-tag/skill-tag.module';
import { PositionTagModule } from './modules/position-tag/position-tag.module';
import { UploadModule } from './modules/upload/upload.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { MethodModule } from './modules/method/method.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    AuthModule,
    UserModule,
    AuthenticodeModule,
    ProjectModule,
    ApplicantModule,
    NotificationModule,
    SkillTagModule,
    PositionTagModule,
    UploadModule,
    PrismaModule,
    MethodModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule {}
