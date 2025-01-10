import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { ProjectService } from '../project/project.service';
import { CreateApplicantDTO } from './dto/create-applicant.dto';

@Injectable()
export class ApplicantService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => EmailService))
    private readonly emailService: EmailService,
    @Inject(forwardRef(() => ProjectService))
    private readonly projectService: ProjectService,
  ) {}

  // 상태에 따른 이메일 전송 (합격/불합격) + 권한 확인
  async sendEmailsToApplicantsByStatus({
    projectId,
    status,
    userId,
  }: {
    projectId: number;
    status: 'ACCEPTED' | 'REJECTED';
    userId?: number;
  }): Promise<void> {
    // 1. 해당 프로젝트 정보 조회
    const project = await this.projectService.fetchProject({
      id: projectId, // projectId가 제대로 전달되도록 수정
    });

    if (userId) {
      // 2. 프로젝트의 authorId와 현재 로그인한 userId가 일치하는지 확인
      if (project.authorId !== userId) {
        throw new UnauthorizedException('이 프로젝트에 대한 권한이 없습니다.');
      }
    }

    // 3. 상태에 맞는 지원자 정보 조회
    const applicants = await this.prisma.applicant.findMany({
      where: {
        projectId,
        status: status as 'ACCEPTED' | 'REJECTED',
      },
      include: { Project: true },
    });

    // 4. 이메일 전송을 위한 데이터 구성
    for (const applicant of applicants) {
      const { email, Project } = applicant;
      if (!email || !Project) {
        continue; // 이메일이나 프로젝트 정보가 없다면 건너뛰기
      }

      const projectName = Project.title;
      const templateData = {
        projectName,
        message:
          status === 'ACCEPTED'
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

  async createApplicant({
    projectId,
    userId,
    data,
  }: {
    projectId: number;
    userId: number;
    data: CreateApplicantDTO;
  }) {
    await this.projectService.fetchProject({ id: projectId });
    const { email, phoneNumber, career, message } = data;

    return await this.prisma.applicant.create({
      data: {
        projectId,
        userId,
        email,
        phoneNumber,
        career: JSON.stringify(career),
        message,
      },
    });
  }

  async fetchManyApplicant({
    projectId,
    authorId,
  }: {
    projectId: number;
    authorId: number;
  }) {
    const project = await this.projectService.fetchProject({ id: projectId });
    if (project.authorId !== authorId) {
      throw new ForbiddenException('해당 공고의 기획자만 조회 가능합니다.');
    }

    return await this.prisma.applicant.findMany({
      where: { projectId },
      include: {
        User: {
          select: {
            id: true,
            nickname: true,
            email: true,
            bio: true,
            profileImg: true,
            UserSkillTag: { include: { SkillTag: true } },
          },
        },
      },
    });
  }

  async modifyApplicantReject({
    projectId,
    authorId,
    status,
  }: {
    authorId?: number;
    projectId: number;
    status: 'REJECTED';
  }) {
    const project = await this.projectService.fetchProject({
      id: projectId,
    });
    if (authorId) {
      if (project.authorId !== authorId) {
        throw new ForbiddenException('기획자만 수정 가능합니다.');
      }
    }

    return await this.prisma.applicant.updateMany({
      where: { projectId, status: 'WAITING' },
      data: { status },
    });
  }

  async fetchApplicantByStatus({
    projectId,
    authorId,
  }: {
    projectId: number;
    authorId: number;
  }) {
    const allApplicant = await this.fetchManyApplicant({
      projectId,
      authorId,
    });

    // 상태별 필터링
    const accepted = allApplicant.filter((a) => a.status === 'ACCEPTED');
    const rejected = allApplicant.filter((a) => a.status === 'REJECTED');

    return { accepted, rejected };
  }

  async modifyApplicantStatus({
    projectId,
    authorId,
    userId,
    status,
  }: {
    authorId: number;
    userId: number;
    projectId: number;
    status: 'ACCEPTED' | 'WAITING' | 'REJECTED';
  }) {
    const project = await this.projectService.fetchProject({
      id: projectId,
    });
    if (project.authorId !== authorId) {
      throw new ForbiddenException('기획자만 수정 가능합니다.');
    }
    if (project.isDone) {
      throw new BadRequestException(
        '마감한 공고는 지원자의 상태를 변경할 수 없습니다.',
      );
    }

    const applicant = await this.prisma.applicant.findFirst({
      where: { projectId, userId },
    });
    if (!applicant) {
      throw new NotFoundException('지원자를 찾을 수 없습니다.');
    }
    if (applicant.status === status) {
      throw new BadRequestException('상태가 이미 동일합니다.');
    }

    return await this.prisma.applicant.update({
      where: { id: applicant.id },
      data: { status },
    });
  }
}
