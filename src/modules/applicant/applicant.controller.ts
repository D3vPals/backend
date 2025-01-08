import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApplicantService } from './applicant.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../../decorators/curretUser.decorator';
import { SendEmailDTO } from "./dto/send-email.dto"

@ApiTags('applicant')
@Controller('applicant')
export class ApplicantController {
  constructor(private readonly applicantService: ApplicantService) {}

  // 합격한 지원자에게 이메일 전송 (POST)
  @Post('send-emails/accepted')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '합격한 지원자에게 이메일 전송',
    description: '합격한 지원자에게 이메일을 일괄 전송합니다.',
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
        message: '합격한 지원자가 없습니다.',
        error: 'Bad Request',
      },
    },
  })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  async postSendEmailsToAcceptedApplicants(@Body() { projectId }: SendEmailDTO, @CurrentUser() userId: number) {

    await this.applicantService.sendEmailsToApplicantsByStatus({ projectId, status: 'ACCEPTED', userId });

    return { message: '이메일 전송 완료' };
  }

  // 불합격한 지원자에게 이메일 전송 (POST)
  @Post('send-emails/rejected')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '불합격한 지원자에게 이메일 전송',
    description: '불합격한 지원자에게 이메일을 일괄 전송합니다.',
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
        message: '불합격한 지원자가 없습니다.',
        error: 'Bad Request',
      },
    },
  })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  async postSendEmailsToRejectedApplicants(@Body() { projectId }: SendEmailDTO, @CurrentUser() userId: number) {
    
    await this.applicantService.sendEmailsToApplicantsByStatus({ projectId, status: 'REJECTED', userId });

    return { message: '이메일 전송 완료' };
  }
}
