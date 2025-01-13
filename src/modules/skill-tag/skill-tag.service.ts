import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SkillTagService {
  constructor(private prismaService: PrismaService) {}

  async fetchManySkillTag() {
    return await this.prismaService.skillTag.findMany();
  }

  async fetchSkillTag({ id }: { id: number }) {
    const skillTag = await this.prismaService.skillTag.findUnique({
      where: { id },
    });
    if (!skillTag) {
      throw new NotFoundException('해당 스킬 태그 존재하지 않습니다.');
    }

    return skillTag;
  }

  async fetchPositionTag({ id }: { id: number }) {
    const positionTag = await this.prismaService.positionTag.findUnique({
      where: { id },
    });
    if (!positionTag) {
      throw new NotFoundException('해당 포지션 태그가 존재하지 않습니다.');
    }

    return positionTag;
  }
}
