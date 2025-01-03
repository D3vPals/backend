import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PositionTagService {
  constructor(private prismaService: PrismaService) {}

  async fetchManyPositionTag() {
    return await this.prismaService.positionTag.findMany();
  }
}
