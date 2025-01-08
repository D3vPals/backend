import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { ProjectService } from '../project/project.service';

@Injectable()
export class ApplicantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly projectService: ProjectService
  ) {}

  // 상태에 따른 이메일 전송 (합격/불합격) + 권한 확인
  async sendEmailsToApplicantsByStatus({ projectId, status, userId }:{ projectId: number, status: "ACCEPTED" | "REJECTED", userId: number }): Promise<void> {
    // 1. 해당 프로젝트 정보 조회
    const project = await this.projectService.fetchProject({
      id: projectId,  // projectId가 제대로 전달되도록 수정
    });

    // 2. 프로젝트의 authorId와 현재 로그인한 userId가 일치하는지 확인
    if (project.authorId !== userId) {
      throw new UnauthorizedException('이 프로젝트에 대한 권한이 없습니다.');
    }
  
    // 3. 상태에 맞는 지원자 정보 조회
    const applicants = await this.prisma.applicant.findMany({
      where: {
        projectId,
        status: status as "ACCEPTED" | "REJECTED",
      },
      include: { Project: true },
    });
  
    if (!applicants.length) {
      throw new NotFoundException(`${status === 'ACCEPTED' ? '합격' : '불합격'}한 지원자가 없습니다.`);
    }
  
    // 4. 이메일 전송을 위한 데이터 구성
    for (const applicant of applicants) {
      const { email, Project } = applicant;
      if (!email || !Project) {
        continue;  // 이메일이나 프로젝트 정보가 없다면 건너뛰기
      }
      
      const projectName = Project.title;
      const templateData = {
        projectName,
        message: status === 'ACCEPTED'
          ? `축하합니다! ${projectName} 프로젝트에 합격하셨습니다.`
          : `안타깝지만 ${projectName} 프로젝트에 불합격하셨습니다.`,
      };
  
      // 5. 이메일 전송
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
}