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

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET, // 환경 변수로 관리
      signOptions: { expiresIn: '1m' }, // 기본 설정
    }),
    AuthenticodeModule,
    UploadModule,
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
