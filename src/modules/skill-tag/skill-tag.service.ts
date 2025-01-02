import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SkillTagService {
  constructor(private prismaService: PrismaService) {}

  async fetchManySkillTag() {
    return await this.prismaService.skillTag.findMany();
  }
}
