import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetManyProjectDTO } from './dto/get-project.dto';
import { PAGE_SIZE } from 'src/constants/pagination';
import { ProjectDTO } from './dto/project.dto';

@Injectable()
export class ProjectService {
  constructor(private prismaService: PrismaService) {}

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
    data: ProjectDTO;
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
    data: ProjectDTO;
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

    // 트랜잭션 실행
    return await this.prismaService.$transaction(async (prisma) => {
      // 1. 프로젝트 정보 업데이트
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

      // 2. 기존 태그 삭제
      await prisma.projectSkillTag.deleteMany({
        where: { projectId: id },
      });
      await prisma.projectPositionTag.deleteMany({
        where: { projectId: id },
      });

      // 3. 새로운 태그 생성
      await prisma.projectSkillTag.createMany({
        data: skillTagId.map((tagId) => ({
          projectId: id,
          skillTagId: tagId,
        })),
      });

      await prisma.projectPositionTag.createMany({
        data: positionTagId.map((tagId) => ({
          projectId: id,
          positionTagId: tagId,
        })),
      });

      return updatedProject;
    });
  }
}
