import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class ApplicantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  // DB 상태 확인 후 이메일 전송
  async sendEmailToApplicant(applicantId: number): Promise<void> {
    // 1. 지원자 정보와 프로젝트 정보 조회
    const applicant = await this.prisma.applicant.findUnique({
      where: { id: applicantId },
      include: { Project: true }, // 프로젝트 정보를 포함하여 가져옴
    });

    if (!applicant) {
      throw new NotFoundException('지원자를 찾을 수 없습니다.');
    }

    // 2. 지원자의 상태 확인
    const { status, email, Project } = applicant;
    if (!email) {
      throw new BadRequestException('지원자의 이메일 정보가 없습니다.');
    }

    if (!Project) {
      throw new BadRequestException('지원자가 연결된 프로젝트 정보를 찾을 수 없습니다.');
    }

    if (status === 'WAITING') {
      throw new BadRequestException('대기 상태인 지원자에게는 이메일을 전송할 수 없습니다.');
    }

    // 3. 상태에 따른 이메일 내용 구성
    const isAccepted = status === 'ACCEPTED';
    const projectName = Project.title; // 프로젝트 이름 가져오기
    const templateData = {
      projectName,
      message: isAccepted
        ? `축하합니다! ${projectName} 프로젝트에 합격하셨습니다.`
        : `안타깝지만 ${projectName} 프로젝트에 불합격하셨습니다.`,
    };

    // 4. 이메일 전송
    try {
      await this.emailService.sendEmail(
        email,
        'DevPals 프로젝트 지원 결과',
        '', // 텍스트 메시지는 템플릿에 포함되므로 비워둠
        'notification', // 템플릿 이름
        templateData, // 템플릿 변수
      );
    } catch (error) {
      console.error('이메일 전송 실패:', error);
      throw new BadRequestException('이메일 전송에 실패했습니다.');
    }
  }
}
