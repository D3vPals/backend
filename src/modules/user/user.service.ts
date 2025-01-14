import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UploadService } from '../upload/upload.service';
import { SkillTagService } from '../skill-tag/skill-tag.service';
import { ApplicationStatusDto } from './dto/application-status.dto';
import { CareerDto } from './dto/my-info-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MyInfoResponseDto } from './dto/my-info-response.dto';
import { ProjectResponseDto } from './dto/project-response.dto';


@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private s3Service: UploadService,
    private skillTagService : SkillTagService,
    private positionTagService : SkillTagService,
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

  async getUserInfoWithSkills(userId: number): Promise<MyInfoResponseDto | null> {
    if (!userId || typeof userId !== 'number') {
      return null; // 사용자 ID가 잘못된 경우 null 반환
    }
  
    const userWithSkills = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        positionTag: {
          select: { id: true, name: true },
        },
        UserSkillTag: {
          include: {
            SkillTag: {
              select: { name: true, img: true },
            },
          },
        },
      },
    });
  
    if (!userWithSkills) {
      return null; // 사용자 정보가 없는 경우 null 반환
    }
  
    // `career` 필드 파싱
    let parsedCareer: CareerDto[] = [];
    try {
      const careerData = userWithSkills.career as unknown as string; // 문자열로 변환
      parsedCareer = careerData ? JSON.parse(careerData) : []; // JSON 파싱
    } catch (error) {
      console.error('Error parsing career field:', error);
    }
  
    
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

  async updateUser(userId: number, updateUserDto: UpdateUserDto): Promise<MyInfoResponseDto> {
    const { positionTagId, skillTagIds, career, ...updateData } = updateUserDto;
  
    // 유저 확인
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!existingUser) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
  
    // 포지션 태그 검증 및 업데이트
    if (positionTagId) {
      // 포지션 태그 유효성 검증
      const positionTag = await this.positionTagService.fetchPositionTag({ id: positionTagId });
  
      // 기존 포지션 태그 삭제 후 업데이트
      await this.prisma.user.update({
        where: { id: userId },
        data: { positionTagId: null },
      });
  
      await this.prisma.user.update({
        where: { id: userId },
        data: { positionTagId: positionTag.id },
      });
    }
  
    // 스킬 태그 삭제 후 추가
    if (skillTagIds && skillTagIds.length > 0) {
      // 스킬 태그 검증
      const skillTags = await Promise.all(
        skillTagIds.map((id) => this.skillTagService.fetchSkillTag({ id })),
      );
  
      // 기존 스킬 태그 삭제
      await this.prisma.userSkillTag.deleteMany({
        where: { userId },
      });
  
      // 새로운 스킬 태그 생성
      await this.prisma.userSkillTag.createMany({
        data: skillTags.map((tag) => ({
          userId,
          skillTagId: tag.id,
        })),
      });
    }
  
    // `career` 필드 JSON으로 변환
    let careerJson = null;
    if (career) {
      try {
        careerJson = JSON.stringify(career);
      } catch (error) {
        throw new BadRequestException('잘못된 career 데이터 형식입니다.');
      }
    }
  
    // 사용자 정보 업데이트
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...updateData,
        career: careerJson,
      },
    });
  
    // 업데이트된 데이터 가져오기
    return this.getUserInfoWithSkills(userId);
  }

  async fetchManyAcceptedProjects(userId: number): Promise<ProjectResponseDto[]> {
    const applicants = await this.prisma.applicant.findMany({
      where: {
        userId,
        status: 'ACCEPTED', // 필터링
      },
      include: {
        Project: {
          include: {
            ProjectSkillTag: {
              include: { SkillTag: true },
            },
            ProjectPositionTag: {
              include: { PositionTag: true },
            },
          },
        },
      },
    });
  
    // 필요한 데이터만 가공하여 반환
    return applicants.map((applicant) => {
      const project = applicant.Project;
  
      return {
        projectId: project.id,
        title: project.title,
        description: project.description,
        startDate: project.startDate.toISOString(),
        estimatedPeriod: project.estimatedPeriod,
        isBeginner: project.isBeginner,
        methodId: project.methodId,
        recruitmentStartDate: project.recruitmentStartDate.toISOString(),
        recruitmentEndDate: project.recruitmentEndDate.toISOString(),
        status: 'ACCEPTED', // 항상 ACCEPTED 상태 유지
        ProjectSkillTag: project.ProjectSkillTag.map((tag) => ({
          projectId: tag.projectId,
          skillTagId: tag.skillTagId,
          SkillTag: {
            id: tag.SkillTag.id,
            name: tag.SkillTag.name,
            img: tag.SkillTag.img,
          },
        })),
        ProjectPositionTag: project.ProjectPositionTag.map((tag) => ({
          projectId: tag.projectId,
          positionTagId: tag.positionTagId,
          PositionTag: {
            id: tag.PositionTag.id,
            name: tag.PositionTag.name,
          },
        })),
      };
    });
  }


}
