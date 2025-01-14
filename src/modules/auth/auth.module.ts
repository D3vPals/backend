import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticodeModule } from '../authenticode/authenticode.module';
import { UploadModule } from '../upload/upload.module';
import { PositionTagModule } from '../position-tag/position-tag.module';
import { SkillTagModule } from '../skill-tag/skill-tag.module'; 

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET, // 환경 변수로 관리
      signOptions: { expiresIn: '1h' }, // 기본 설정
    }),
    AuthenticodeModule,
    UploadModule,
    PositionTagModule,
    SkillTagModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    JwtStrategy,
    JwtAuthGuard,
    UserService,
  ],
  exports: [JwtModule, JwtAuthGuard],
})
export class AuthModule {}
