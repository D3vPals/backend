import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetManyProjectDTO } from './dto/get-project.dto';
import { PAGE_SIZE } from 'src/constants/pagination';
import { CreateProjectDTO } from './dto/create-project.dto';
import { ModifyProjectDTO } from './dto/modify-project.dto';
import { MethodService } from '../method/method.service';
import { PositionTagService } from '../position-tag/position-tag.service';
import { SkillTagService } from '../skill-tag/skill-tag.service';
import { ApplicantService } from '../applicant/applicant.service';

@Injectable()
export class ProjectService {
  constructor(
    private prismaService: PrismaService,
    private methodService: MethodService,
    private positionTagService: PositionTagService,
    private skillTagService: SkillTagService,
    @Inject(forwardRef(() => ApplicantService))
    private applicantService: ApplicantService,
  ) {}

  async fetchManyProject(dto: GetManyProjectDTO) {
    const skipAmount = (dto.page - 1) * PAGE_SIZE;

    // 기본 where 조건
    const where: any = {};

    // 키워드 조건 추가
    if (dto.keyword) {
      where.OR = [
        { title: { contains: dto.keyword } },
        { description: { contains: dto.keyword } },
      ];
    }

    // 스킬 태그 조건 추가
    if (dto.skillTag && dto.skillTag.length > 0) {
      where.ProjectSkillTag = {
        some: {
          skillTagId: { in: dto.skillTag },
        },
      };
    }

    // 포지션 태그 조건 추가
    if (dto.positionTag) {
      where.ProjectPositionTag = {
        some: {
          PositionTag: {
            id: dto.positionTag,
          },
        },
      };
    }

    // 진행 방식 조건 추가
    if (dto.methodId) {
      where.methodId = dto.methodId;
    }

    // 새싹 가능 조건 추가
    if (dto.isBeginner !== undefined) {
      if (dto.isBeginner !== true && dto.isBeginner !== null) {
        throw new BadRequestException(
          'isBeginner 값은 true 또는 null만 허용됩니다.',
        );
      }
      where.isBeginner = dto.isBeginner;
    }

    // user 비밀번호 제외 항목만, 포지션, 진행 방식, 스킬 정보도 같이 내려주기
    const projects = await this.prismaService.project.findMany({
      skip: skipAmount,
      take: PAGE_SIZE,
      where,
      include: {
        User: {
          select: {
            id: true,
            nickname: true,
            email: true,
            bio: true,
            profileImg: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        ProjectSkillTag: {
          include: { SkillTag: true },
        },
        Method: true,
        ProjectPositionTag: {
          include: { PositionTag: true },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    const transformedProjects = projects.map((project) => ({
      ...project,
      skillTags: project.ProjectSkillTag.map((tag) => ({
        id: tag.SkillTag.id,
        name: tag.SkillTag.name,
        img: tag.SkillTag.img,
        createdAt: tag.SkillTag.createdAt,
      })),
      positionTags: project.ProjectPositionTag.map((tag) => ({
        id: tag.PositionTag.id,
        name: tag.PositionTag.name,
        createdAt: tag.PositionTag.createdAt,
      })),
    }));

    const total = await this.prismaService.project.count({ where });
    const currentPage = dto.page;
    const lastPage = Math.ceil(total / PAGE_SIZE);

    return { projects: transformedProjects, total, currentPage, lastPage };
  }

  // 진행중, 마감, 전체 공고 개수
  async fetchProjectCount() {
    // 전체 공고 개수
    const totalProjectCount = await this.prismaService.project.count();
    // 마감된 공고 개수
    const endProjectCount = await this.prismaService.project.count({
      where: { isDone: true },
    });

    return {
      ongoingProjectCount: totalProjectCount - endProjectCount,
      endProjectCount,
      totalProjectCount,
    };
  }

  async incrementViews(id: number) {
    // views를 증가시킬 때만 호출
    await this.fetchProject({ id });

    return this.prismaService.project.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  }

  async fetchProject({ id }: { id: number }) {
    if (id === 0 || isNaN(id)) {
      throw new BadRequestException(
        'Invalid ID: ID must be a valid number and not 0.',
      );
    }

    const project = await this.prismaService.project.findUnique({
      where: { id },
      include: {
        User: {
          select: {
            id: true,
            nickname: true,
            email: true,
            bio: true,
            profileImg: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        ProjectSkillTag: {
          include: { SkillTag: true },
        },
        Method: true,
        ProjectPositionTag: {
          include: { PositionTag: true },
        },
        Applicant: { include: { User: true } },
      },
    });

    if (!project) {
      throw new NotFoundException('해당 공고는 존재하지 않습니다.');
    }

    return {
      ...project,
      skillTags: project.ProjectSkillTag.map((tag) => ({
        id: tag.SkillTag.id,
        name: tag.SkillTag.name,
        img: tag.SkillTag.img,
        createdAt: tag.SkillTag.createdAt,
      })),
      positionTags: project.ProjectPositionTag.map((tag) => ({
        id: tag.PositionTag.id,
        name: tag.PositionTag.name,
        createdAt: tag.PositionTag.createdAt,
      })),
    };
  }

  async createProject({
    authorId,
    data,
  }: {
    authorId: number;
    data: CreateProjectDTO;
  }) {
    const {
      title,
      description,
      totalMember,
      startDate,
      estimatedPeriod,
      methodId,
      isBeginner,
      recruitmentStartDate,
      recruitmentEndDate,
      skillTagId,
      positionTagId,
    } = data;

    // 진행 방식 검증
    await this.methodService.fetchMethod({ id: methodId });

    // 스킬 태그 검증
    const skillTags = await Promise.all(
      skillTagId.map((id) => this.skillTagService.fetchSkillTag({ id })),
    );

    // 포지션 태그 검증
    const positionTags = await Promise.all(
      positionTagId.map((id) =>
        this.positionTagService.fetchPositionTag({ id }),
      ),
    );

    const createdProject = await this.prismaService.project.create({
      data: {
        title,
        description,
        totalMember,
        startDate,
        estimatedPeriod,
        methodId,
        isBeginner,
        recruitmentStartDate,
        recruitmentEndDate,
        authorId,
      },
    });

    await this.prismaService.projectSkillTag.createMany({
      data: skillTags.map((tag) => ({
        projectId: createdProject.id,
        skillTagId: tag.id,
      })),
    });

    await this.prismaService.projectPositionTag.createMany({
      data: positionTags.map((tag) => ({
        projectId: createdProject.id,
        positionTagId: tag.id,
      })),
    });

    return createdProject;
  }

  async modifyProject({
    authorId,
    id,
    data,
  }: {
    authorId: number;
    id: number;
    data: ModifyProjectDTO;
  }) {
    const {
      title,
      description,
      totalMember,
      startDate,
      estimatedPeriod,
      methodId,
      isBeginner,
      recruitmentStartDate,
      recruitmentEndDate,
      skillTagId,
      positionTagId,
    } = data;

    const project = await this.fetchProject({ id });
    if (project.authorId !== authorId) {
      throw new ForbiddenException('기획자만 수정 가능합니다.');
    }

    if (methodId) {
      // 진행 방식 검증
      await this.methodService.fetchMethod({ id: methodId });
    }

    // 트랜잭션 실행
    return await this.prismaService.$transaction(async (prisma) => {
      // 프로젝트 정보 업데이트
      const updatedProject = await prisma.project.update({
        where: { id },
        data: {
          title,
          description,
          totalMember,
          startDate,
          estimatedPeriod,
          methodId,
          isBeginner,
          recruitmentStartDate,
          recruitmentEndDate,
        },
      });

      if (skillTagId) {
        // 스킬 태그 검증
        const skillTags = await Promise.all(
          skillTagId.map((id) => this.skillTagService.fetchSkillTag({ id })),
        );

        // 기존 스킬 태그 삭제
        await prisma.projectSkillTag.deleteMany({
          where: { projectId: id },
        });

        // 새로운 스킬 태그 생성
        await prisma.projectSkillTag.createMany({
          data: skillTags.map((tag) => ({
            projectId: id,
            skillTagId: tag.id,
          })),
        });
      }

      if (positionTagId) {
        // 포지션 태그 검증
        const positionTags = await Promise.all(
          positionTagId.map((id) =>
            this.positionTagService.fetchPositionTag({ id }),
          ),
        );

        // 기존 포지션 태그 삭제
        await prisma.projectPositionTag.deleteMany({
          where: { projectId: id },
        });

        // 새로운 포지션 태그 생성
        await prisma.projectPositionTag.createMany({
          data: positionTags.map((tag) => ({
            projectId: id,
            positionTagId: tag.id,
          })),
        });
      }

      return updatedProject;
    });
  }

  async modifyProjectIsDone({
    id,
    authorId,
  }: {
    id: number;
    authorId: number;
  }) {
    const project = await this.fetchProject({ id });
    if (project.authorId !== authorId) {
      throw new ForbiddenException('기획자만 모집을 종료할 수 있습니다.');
    }

    try {
      // 상태 변경과 이메일 전송 병렬 처리
      const modifyRejectPromise = this.applicantService.modifyApplicantReject({
        projectId: id,
        authorId,
        status: 'REJECTED',
      });

      const sendAcceptedEmailsPromise =
        this.applicantService.sendEmailsToApplicantsByStatus({
          projectId: id,
          status: 'ACCEPTED',
          userId: authorId,
        });

      const sendRejectedEmailsPromise =
        this.applicantService.sendEmailsToApplicantsByStatus({
          projectId: id,
          status: 'REJECTED',
          userId: authorId,
        });

      // 병렬 처리 완료 대기
      await Promise.all([
        modifyRejectPromise,
        sendAcceptedEmailsPromise,
        sendRejectedEmailsPromise,
      ]);

      // 프로젝트 상태 업데이트
      return await this.prismaService.project.update({
        where: { id },
        data: { isDone: true },
      });
    } catch (error) {
      console.error('Error processing project completion:', error);
      throw error; // 에러를 다시 던져 호출자에게 알림
    }
  }

  async fetchManyMyProject({ authorId }: { authorId: number }) {
    return await this.prismaService.project.findMany({
      where: { authorId },
      include: {
        ProjectSkillTag: { include: { SkillTag: true } },
        ProjectPositionTag: { include: { PositionTag: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
