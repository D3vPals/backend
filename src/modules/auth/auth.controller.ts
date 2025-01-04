import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthService } from './auth.service';
import { CurrentUser } from 'src/decorators/curretUser.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST: 회원 가입
  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '회원가입',
    description:
      '사용자의 이메일, 닉네임, 비밀번호, 인증 코드를 통해 회원가입을 처리합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '회원 가입 성공',
    schema: {
      example: {
        success: true,
        message: '회원가입이 완료되었습니다.',
        user: {
          id: 1,
          email: 'devpals@mail.com',
          nickname: '김개발',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '유효성 검사 실패',
    schema: {
      example: {
        statusCode: 400,
        message: [
          '이메일을 입력해주세요.',
          '비밀번호는 8자 이상 20자 이하로 입력해주세요.',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증 코드 오류',
    schema: {
      example: {
        statusCode: 401,
        message: '유효하지 않거나 이미 사용된 인증 코드입니다.',
        error: 'Unauthorized',
      },
    },
  })
  async postSignUp(@Body() signUpDto: SignUpDto) {
    const result = await this.authService.signUp(signUpDto);
    return result; // authService.signUp()의 응답을 그대로 반환
  }

  // POST: 로그인
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '로그인',
    description: '이메일과 비밀번호로 로그인하여 JWT를 반환합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    schema: {
      example: {
        success: true,
        message: '로그인 되었습니다.',
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '가입되지 않은 계정',
    schema: {
      example: {
        success: false,
        message: '가입되지 않은 계정입니다.',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 비밀번호',
    schema: {
      example: {
        success: false,
        message: '비밀번호가 틀렸습니다.',
        data: null,
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증에 실패했습니다.' })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async postLogin(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // POST: 비밀번호 재설정
  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '비밀번호 재설정',
    description: '이메일과 인증 코드를 통해 비밀번호를 재설정합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '비밀번호가 성공적으로 재설정되었습니다.',
    schema: {
      example: {
        success: true,
        message: '비밀번호가 성공적으로 재설정되었습니다.',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '유효하지 않은 인증 코드입니다.',
    schema: {
      example: {
        message: '유효하지 않은 인증 코드입니다.',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증 코드가 만료되었습니다.',
    schema: {
      example: {
        message: '인증 코드가 만료되었습니다.',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  async postResetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  // POST: 로그아웃
  @Post('logout')
  @ApiOperation({
    summary: '로그아웃',
    description: '로그아웃을 수행하고 세션을 무효화합니다.',
  })
  @ApiBearerAuth('JWT')
  @ApiResponse({
    status: 201,
    description: '로그아웃 성공',
    schema: {
      example: {
        message: '로그아웃에 성공했습니다',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'JWT 인증 실패',
    schema: {
      example: {
        statusCode: 401,
        message: '유효하지 않거나 만료된 토큰입니다',
        error: 'Unauthorized',
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  async postLogout(@CurrentUser() userId: number) {
    await this.authService.logout(userId);

    return { message: '로그아웃에 성공했습니다' };
  }

  // POST: 리프레쉬 토큰 갱신
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '토큰 갱신',
    description:
      '리프레시 토큰을 사용해 새로운 액세스 토큰과 리프레시 토큰을 발급받습니다.',
  })
  @ApiBody({
    description: '리프레시 토큰 요청 본문',
    schema: {
      example: {
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '새로운 액세스 및 리프레시 토큰 발급 성공',
    schema: {
      example: {
        success: true,
        message: '토큰 갱신 성공',
        data: {
          accessToken: 'new_access_token',
          refreshToken: 'new_refresh_token',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '유효하지 않거나 만료된 리프레시 토큰',
    schema: {
      example: {
        success: false,
        message: 'Invalid refresh token',
      },
    },
  })
  async postRefresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshTokens(refreshToken);
  }
}
