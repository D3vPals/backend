import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetManyProjectDTO } from './dto/get-project.dto';
import { PAGE_SIZE } from 'src/constants/pagination';
import { PostProjectDTO } from './dto/create-project.dto';

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
    if (dto.method) {
      where.Method = {
        some: {
          Method: {
            id: dto.method,
          },
        },
      };
    }

    // 새싹 가능 조건 추가
    if (dto.isBeginner) {
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

  async fetchProject({ id }: { id: number }) {
    await this.prismaService.project.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    const project = await this.prismaService.project.findFirst({
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
    data: PostProjectDTO;
  }) {
    return await this.prismaService.project.create({
      data: { authorId, ...data },
    });
  }
}
