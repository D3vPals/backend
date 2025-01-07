import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PositionTagService {
  constructor(private prismaService: PrismaService) {}

  async fetchManyPositionTag() {
    return await this.prismaService.positionTag.findMany();
  }

  async fetchPositionTag({ id }: { id: number }) {
    const positionTag = await this.prismaService.positionTag.findUnique({
      where: { id },
    });
    if (!positionTag) {
      throw new NotFoundException('해당 포지션 태그는 존재하지 않습니다.');
    }

    return positionTag;
  }
}
