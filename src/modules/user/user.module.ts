import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { UploadModule } from '../upload/upload.module';
import { AuthModule } from '../auth/auth.module';
import { SkillTagModule } from '../skill-tag/skill-tag.module';
import { PositionTagModule } from '../position-tag/position-tag.module';

@Module({
  imports: [UploadModule, AuthModule, SkillTagModule, PositionTagModule],
  controllers: [UserController],
  providers: [UserService, PrismaService],
  exports: [UserService],
})
export class UserModule {}
