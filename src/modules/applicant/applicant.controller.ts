import { Controller, Post, Param, HttpCode, HttpStatus,UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApplicantService } from './applicant.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

@ApiTags('applicant')
@Controller('applicant')
export class ApplicantController {
  constructor(private readonly applicantService: ApplicantService) {}

  @Post(':id/send-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '지원자의 상태에 따라 이메일 전송',
    description: '지원자의 상태를 확인한 후, 합격/불합격 여부에 따라 이메일을 전송합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '이메일 전송 성공',
    schema: {
      example: {
        message: '이메일 전송 완료',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '이메일 전송 실패',
    schema: {
      example: {
        statusCode: 400,
        message: '대기 상태인 지원자에게는 이메일을 전송할 수 없습니다.',
        error: 'Bad Request',
      },
    },
  })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  async sendEmailToApplicant(@Param('id') applicantId: number) {
    await this.applicantService.sendEmailToApplicant(applicantId);
    return { message: '이메일 전송 완료' };
  }
}
