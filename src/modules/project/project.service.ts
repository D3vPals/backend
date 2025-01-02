import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetManyProjectDTO } from './dto/get-project.dto';
import { PAGE_SIZE } from 'src/constants/pagination';
import { exclude } from 'src/helpers/exclude';

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
}
