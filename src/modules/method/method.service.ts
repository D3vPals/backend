import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MethodService {
  constructor(private prismaService: PrismaService) {}

  async fetchManyMethod() {
    return await this.prismaService.method.findMany();
  }

  async fetchMethod({ id }: { id: number }) {
    const method = await this.prismaService.method.findUnique({
      where: { id },
    });
    if (!method) {
      throw new NotFoundException('해당 진행 방식은 존재하지 않습니다.');
    }

    return method;
  }
}
