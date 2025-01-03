import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { AuthenticodeService } from './authenticode.service';
import { SendEmailCodeDto } from './dto/send-email-code.dto';
import { VerifyEmailCodeDto } from './dto/verify-email-code.dto';

@ApiTags('Authenticode')
@Controller('authenticode')
export class AuthenticodeController {
  constructor(private readonly authenticodeService: AuthenticodeService) {}

  // POST: 이메일 인증 코드 발송
  @Post('send')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '이메일 인증 코드 발송',
    description: '입력된 이메일로 인증 코드를 발송합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '메일이 발송되었습니다.',
  })
  @ApiResponse({
    status: 400,
    description: '유효한 이메일을 입력해주세요.',
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 오류로 인해 메일 발송에 실패했습니다.',
  })
  async postSendEmailCode(@Body() sendEmailCodeDto: SendEmailCodeDto) {
    return this.authenticodeService.sendEmailCode(sendEmailCodeDto.email);
  }

  // POST: 이메일 인증 코드 확인
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '이메일 인증 코드 확인',
    description: '사용자가 입력한 이메일과 인증 코드의 유효성을 확인합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '인증 코드가 확인되었습니다.',
  })
  @ApiResponse({
    status: 400,
    description: '유효한 이메일을 입력해주세요.',
  })
  @ApiResponse({
    status: 401,
    description: '인증 코드가 만료되었습니다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 오류로 인해 인증 코드 확인에 실패했습니다.',
  })
  async postVerifyEmailCode(@Body() verifyEmailCodeDto: VerifyEmailCodeDto) {
    return this.authenticodeService.verifyEmailCode(
      verifyEmailCodeDto.email,
      verifyEmailCodeDto.code,
    );
  }
}
