import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async checkNicknameAvailability(nickname: string): Promise<boolean> {
    const existingUser = await this.prisma.user.findUnique({
      where: { nickname },
    });

    // 닉네임이 이미 존재하면 false 반환
    return !existingUser;
  }
}
