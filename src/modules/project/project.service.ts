import {
  BadRequestException,
  ForbiddenException,
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

@Injectable()
export class ProjectService {
  constructor(
    private prismaService: PrismaService,
    private methodService: MethodService,
    private positionTagService: PositionTagService,
    private skillTagService: SkillTagService,
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
        every: {
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

    const total = await this.prismaService.project.count({ where });
    const currentPage = dto.page;
    const lastPage = Math.ceil(total / PAGE_SIZE);

    return { projects, total, currentPage, lastPage };
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
      },
    });

    if (!project) {
      throw new NotFoundException('해당 공고는 존재하지 않습니다.');
    }

    return project;
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

    // projectSkillTag 생성
    await this.prismaService.projectSkillTag.createMany({
      data: skillTagId.map((tagId) => ({
        projectId: createdProject.id,
        skillTagId: tagId,
      })),
    });

    // projectPositionTag 생성
    await this.prismaService.projectPositionTag.createMany({
      data: positionTagId.map((tagId) => ({
        projectId: createdProject.id,
        positionTagId: tagId,
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
}
