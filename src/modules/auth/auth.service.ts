import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from './dto/signup.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  // 회원가입 로직
  async signUp(signUpDto: SignUpDto) {
    const { email, password, nickname } = signUpDto;

    // 이메일 중복 체크
    const isEmailAvailable =
      await this.userService.checkEmailAvailability(email);
    if (!isEmailAvailable) {
      throw new BadRequestException('이미 사용 중인 이메일입니다.');
    }

    // 닉네임 중복 체크
    const isNicknameAvailable = await this.userService.checkNicknameAvailability(nickname);
    if (!isNicknameAvailable) {
      throw new BadRequestException('이미 사용 중인 닉네임입니다.');
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 유저 생성
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nickname,
      },
    });

    // 성공 메시지 반환
    return {
      success: true,
      message: '회원가입이 완료되었습니다.',
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
      },
    };
  }

  // 비밀번호 재설정 로직
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, newPassword } = resetPasswordDto;

    // 1. 이메일로 사용자 찾기 (userService에서 처리)
    const user = await this.userService.findUserByEmail(email); // userService를 사용하여 이메일로 사용자 찾기
    if (!user) {
      throw new BadRequestException('등록되지 않은 이메일입니다.');
    }

    // 2. 사용자 비밀번호 업데이트
    await this.userService.updatePasswordByEmail(email, newPassword);
    return {
      success: true,
      message: '비밀번호가 성공적으로 재설정되었습니다.',
    };
  }

  // 로그인
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;


    // 1. 사용자 확인
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      throw new BadRequestException({
        success: false,
        message: '가입되지 않은 계정입니다.',
        data: null,
      });
    }

    // 2. 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException({
        success: false,
        message: '비밀번호가 틀렸습니다.',
        data: null,
      });
    }

    // 3. 액세스 토큰 생성
    const accessToken = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '1h' },
    );

    // 4. 리프레시 토큰 생성 (해싱하지 않고 원본 그대로 저장)
    const rawRefreshToken = this.jwtService.sign(
      { sub: user.id },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
    );

    // 5. 리프레시 토큰을 해싱하지 않고 원본 그대로 저장
    await this.prisma.session.upsert({
      where: { userId: user.id }, // userId를 고유 필드로 사용
      create: {
        userId: user.id,
        accessToken,
        refreshToken: rawRefreshToken, // 해싱하지 않고 원본 그대로 저장
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 후 만료
      },
      update: {
        accessToken,
        refreshToken: rawRefreshToken, // 해싱하지 않고 원본 그대로 저장
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 후 갱신
      },
    });

    // 6. 성공 응답 반환
    return {
      success: true,
      message: '로그인 되었습니다',
      data: {
        accessToken,
        refreshToken: rawRefreshToken, // 원본 리프레시 토큰을 반환
      },
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
      },
    };
  }

  // 로그아웃
  async logout(userId: number) {
    // Session 테이블에서 userId에 해당하는 모든 세션 삭제
    await this.prisma.session.deleteMany({
      where: { userId },
    });

    return { message: '로그아웃 성공' };
  }

  // 리프레쉬 토큰 갱신
  async refreshTokens(refreshToken: string) {
    try {
      // 리프레시 토큰 검증
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      // Session 테이블에서 리프레시 토큰 검증
      const session = await this.prisma.session.findUnique({
        where: { userId: payload.sub },
      });

      // 세션이 없거나 리프레시 토큰이 일치하지 않으면 오류 발생
      if (!session || session.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // 새로운 액세스 토큰 생성
      const newAccessToken = this.jwtService.sign(
        { sub: payload.sub, email: payload.email },
        { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '1h' },
      );

      // 새로운 리프레시 토큰 생성
      const newRefreshToken = this.jwtService.sign(
        { sub: payload.sub },
        { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
      );

      // 세션 갱신: 새로운 리프레시 토큰을 DB에 저장
      await this.prisma.session.update({
        where: { userId: payload.sub },
        data: {
          accessToken: newAccessToken, // 새로운 액세스 토큰 저장
          refreshToken: newRefreshToken, // 리프레시 토큰을 해싱하지 않고 원본 그대로 저장
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 후 만료
        },
      });

      // 새로운 토큰 반환
      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
