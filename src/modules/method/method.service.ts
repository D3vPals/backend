import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MethodService {
  constructor(private prismaService: PrismaService) {}

  async fetchManyMethod() {
    return await this.prismaService.method.findMany();
  }
}
