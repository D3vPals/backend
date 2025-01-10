import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UploadService } from '../upload/upload.service';
import { ApplicationStatusDto } from './dto/application-status.dto';
import { CareerDto } from './dto/my-info-response.dto'

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

  async getApplicationsByUserId(userId: number): Promise<ApplicationStatusDto[]> {
    try {
      const applications = await this.prisma.applicant.findMany({
        where: { userId },
        include: {
          Project: {
            select: {
              title: true,
              recruitmentEndDate: true, // 모집 종료 날짜를 가져옴
            },
          },
        },
      });
  
      // 모집 종료 여부를 기준으로 상태를 필터링
      const currentDate = new Date();
  
      return applications
        .map((application) => {
          const isRecruitmentEnded = application.Project?.recruitmentEndDate
            ? new Date(application.Project.recruitmentEndDate) < currentDate
            : false;
  
          // 모집 종료 시 불합격 처리
          if (isRecruitmentEnded && application.status !== 'ACCEPTED') {
            return {
              projectTitle: application.Project?.title || '프로젝트 없음',
              status: 'REJECTED',
            };
          }
  
          // 합격 상태 또는 이미 불합격인 경우만 반환
          if (application.status === 'ACCEPTED' || application.status === 'REJECTED') {
            return {
              projectTitle: application.Project?.title || '프로젝트 없음',
              status: application.status,
            };
          }
  
          return null; // WAITING 상태는 표시하지 않음
        })
        .filter((item) => item !== null); // null 값 제거
    } catch (error) {
      console.error('Error while fetching applications:', error);
      throw new InternalServerErrorException('지원한 프로젝트를 불러오는 중 오류가 발생했습니다.');
    }
  }

  async getUserInfoWithSkills(userId: number) {
    if (!userId || typeof userId !== 'number') {
      return null; // 사용자 ID가 잘못된 경우 null 반환
    }
  
    const userWithSkills = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        positionTag: {
          select: {
            id: true,
            name: true,
          },
        },
        UserSkillTag: {
          include: {
            SkillTag: {
              select: {
                name: true,
                img: true,
              },
            },
          },
        },
      },
    });
  
    if (!userWithSkills) {
      return null; // 사용자 정보가 없는 경우 null 반환
    }
  
    // `career` 필드를 안전하게 파싱
    const parsedCareer: CareerDto[] = userWithSkills.career
  ? (userWithSkills.career as any as CareerDto[]) // 타입 단언 사용
  : [];

  
    return {
      id: userWithSkills.id,
      nickname: userWithSkills.nickname,
      email: userWithSkills.email,
      bio: userWithSkills.bio,
      profileImg: userWithSkills.profileImg,
      userLevel: userWithSkills.userLevel,
      github: userWithSkills.github,
      career: parsedCareer, // 파싱된 JSON 데이터 반환
      positionTag: userWithSkills.positionTag,
      skills: userWithSkills.UserSkillTag.map((userSkill) => ({
        skillName: userSkill.SkillTag.name,
        skillImg: userSkill.SkillTag.img,
      })),
      createdAt: userWithSkills.createdAt,
    };
  }

}