import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private s3Service: UploadService,
  ) {}

  async checkNicknameAvailability(nickname: string): Promise<boolean> {
    const existingUser = await this.prisma.user.findUnique({
      where: { nickname },
    });

    // 닉네임이 이미 존재하면 false 반환
    return !existingUser;
  }

  async checkEmailAvailability(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return user ? false : true; // 이메일이 이미 존재하면 false 반환
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
  
  async updatePasswordByEmail(email: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
     await this.prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
  }

  async updateProfileImage(userId: number, fileBuffer: Buffer, fileType: string) {
    console.log('updateProfileImage - userId:', userId); // 디버깅: userId 값 확인
  
    if (!userId) {
      throw new BadRequestException('사용자 ID를 확인할 수 없습니다.');
    }
  
    try {
      const imageUrl = await this.s3Service.uploadImage(
        'users',
        userId,
        fileBuffer,
        fileType,
      );
  
      // 프로필 이미지 업데이트
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { profileImg: imageUrl },
        select: {
          id: true, // 필요한 필드만 선택
          nickname: true,
          profileImg: true,
        },
      });
  
      return updatedUser;
    } catch (error) {
      console.error('Error while updating profile image:', error);
      throw new InternalServerErrorException('프로필 이미지 업데이트 중 오류가 발생했습니다.');
    }
  }

  async getApplicationsByUserId(userId: number) {
    try {
      const applications = await this.prisma.applicant.findMany({
        where: { userId },
        include: {
          Project: {
            select: { title: true },
          },
        },
      });
  
      return applications.map((application) => ({
        projectTitle: application.Project?.title || '프로젝트 없음',
        status: application.status,
      }));
    } catch (error) {
      console.error('Error while fetching applications:', error);
      throw new InternalServerErrorException('지원한 프로젝트를 불러오는 중 오류가 발생했습니다.');
    }
  }
}