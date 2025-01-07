import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthenticodeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,

  ) {}

  // 메일 인증 코드 생성 및 발송
  async sendEmailCode(email: string): Promise<{ message: string }> {
    // 이메일 형식 검증
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new BadRequestException('유효한 이메일 형식이 아닙니다.');
    }

    // 인증 코드 생성
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // 기존 인증 코드 무효화 및 새로운 인증 코드 저장
    try {
      await this.prisma.authenticode.updateMany({
        where: { userEmail: email, isUsed: false },
        data: { isUsed: true },
      });

      await this.prisma.authenticode.create({
        data: { userEmail: email, code, expiresAt, isUsed: false },
      });
    } catch (error) {
      console.error('데이터베이스 오류:', error);
      throw new BadRequestException('인증 코드 저장 중 오류가 발생했습니다.');
    }

    // 이메일 발송
    await this.emailService.sendEmail(
      email,
      'DevPals 인증 코드',
      '',
      'authenticode', // 템플릿 이름
      { code }, // 템플릿 데이터
    );

    return { message: '인증 코드가 이메일로 전송되었습니다.' };
  }

  async verifyEmailCode(email: string, code: string): Promise<{ message: string }> {
    // 인증 코드 조회
    const authRecord = await this.prisma.authenticode.findFirst({
      where: { userEmail: email, code, isUsed: false },
    });
  
    // 인증 코드 유효성 검증
    if (!authRecord) {
      throw new BadRequestException('유효하지 않은 인증 코드입니다.');
    }
  
    if (authRecord.expiresAt < new Date()) {
      throw new BadRequestException('인증 코드가 만료되었습니다.');
    }
  
    // 인증 코드 상태를 사용 완료로 업데이트
    await this.prisma.authenticode.update({
      where: { id: authRecord.id },
      data: { isUsed: true },
    });
  
    return { message: '인증 코드가 확인되었습니다.' };
  }
}


  

