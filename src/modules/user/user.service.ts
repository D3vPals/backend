import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UploadService } from '../upload/upload.service';
import { SkillTagService } from '../skill-tag/skill-tag.service';
import { PositionTagService } from '../position-tag/position-tag.service';
import { ApplicationStatusDto } from './dto/application-status.dto';
import { CareerDto } from './dto/my-info-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MyInfoResponseDto } from './dto/my-info-response.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { UserProjectsResponseDto } from './dto/user-projects-response.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private s3Service: UploadService,
    private skillTagService: SkillTagService,
    private positionTagService: PositionTagService,
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

  async updatePasswordByEmail(
    email: string,
    newPassword: string,
  ): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
  }

  async updateProfileImage(
    userId: number,
    fileBuffer: Buffer,
    fileType: string,
  ) {
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
      throw new InternalServerErrorException(
        '프로필 이미지 업데이트 중 오류가 발생했습니다.',
      );
    }
  }

  async getApplicationsByUserId(
    userId: number,
  ): Promise<ApplicationStatusDto[]> {
    try {
      const applications = await this.prisma.applicant.findMany({
        where: {
          userId,
          Project: {
            isDone: true, // 완료된 프로젝트만 조회
          },
        },
        include: {
          Project: {
            select: {
              id: true,
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
              id: application.Project?.id,
              projectTitle: application.Project?.title || '프로젝트 없음',
              status: 'REJECTED',
            };
          }

          // 합격 상태 또는 이미 불합격인 경우만 반환
          if (
            application.status === 'ACCEPTED' ||
            application.status === 'REJECTED'
          ) {
            return {
              id: application.Project?.id,
              projectTitle: application.Project?.title || '프로젝트 없음',
              status: application.status,
            };
          }

          return null; // WAITING 상태는 표시하지 않음
        })
        .filter((item) => item !== null); // null 값 제거
    } catch (error) {
      console.error('Error while fetching applications:', error);
      throw new InternalServerErrorException(
        '지원한 프로젝트를 불러오는 중 오류가 발생했습니다.',
      );
    }
  }

  async getUserInfoWithSkills(
    userId: number,
  ): Promise<MyInfoResponseDto | null> {
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

    return {
      id: userWithSkills.id,
      nickname: userWithSkills.nickname,
      email: userWithSkills.email,
      bio: userWithSkills.bio,
      profileImg: userWithSkills.profileImg,
      userLevel: userWithSkills.userLevel,
      github: userWithSkills.github,
      career: userWithSkills.career as unknown as CareerDto[], // 타입 캐스팅
      positionTag: userWithSkills.positionTag,
      skills: userWithSkills.UserSkillTag.map((userSkill) => ({
        skillName: userSkill.SkillTag.name,
        skillImg: userSkill.SkillTag.img,
      })),
      createdAt: userWithSkills.createdAt,
    };
  }

  async updateUser(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<MyInfoResponseDto> {
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
      const positionTag = await this.positionTagService.fetchPositionTag({
        id: positionTagId,
      });

      // 기존 포지션 태그 업데이트
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

    // `career` 필드 JSON으로 변환 및 Prisma InputJsonValue로 처리
    const careerJson = career
      ? (career as unknown as Prisma.InputJsonValue)
      : null;

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

  async fetchManyAcceptedProjects(
    userId: number,
  ): Promise<ProjectResponseDto[]> {
    const applicants = await this.prisma.applicant.findMany({
      where: {
        userId,
        status: 'ACCEPTED', // 필터링
        Project: {
          isDone: true, // 완료된 프로젝트만 가져오기
        },
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
        totalMember: project.totalMember,
        startDate: project.startDate.toISOString(),
        estimatedPeriod: project.estimatedPeriod,
        methodId: project.methodId,
        isBeginner: project.isBeginner,
        isDone: project.isDone,
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

  async fetchManyUserProjectsWithOwn(
    userId: number,
  ): Promise<UserProjectsResponseDto> {
    // 참여한 프로젝트 (합격된 프로젝트만 + 완료된 프로젝트만)
    const acceptedProjects = await this.prisma.applicant.findMany({
      where: {
        userId,
        status: 'ACCEPTED',
        Project: {
          isDone: true, // 완료된 프로젝트만 가져오기
        },
      },
      include: {
        Project: {
          include: {
            ProjectSkillTag: { include: { SkillTag: true } },
            ProjectPositionTag: { include: { PositionTag: true } },
          },
        },
      },
    });

    // 사용자가 기획한 프로젝트 조회
    const ownProjects = await this.prisma.project.findMany({
      where: { authorId: userId },
      include: {
        ProjectSkillTag: { include: { SkillTag: true } },
        ProjectPositionTag: { include: { PositionTag: true } },
      },
      orderBy: { createdAt: 'desc' }, // 등록순 정렬
    });

    return {
      acceptedProjects: acceptedProjects.map((applicant) => {
        const project = applicant.Project;
        return {
          projectId: project.id,
          title: project.title,
          description: project.description,
          totalMember: project.totalMember,
          startDate: project.startDate.toISOString(),
          estimatedPeriod: project.estimatedPeriod,
          methodId: project.methodId,
          isBeginner: project.isBeginner,
          isDone: project.isDone,
          recruitmentStartDate: project.recruitmentStartDate.toISOString(),
          recruitmentEndDate: project.recruitmentEndDate.toISOString(),
          status: 'ACCEPTED',
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
      }),
      ownProjects: ownProjects.map((project) => ({
        projectId: project.id,
        title: project.title,
        description: project.description,
        totalMember: project.totalMember,
        startDate: project.startDate.toISOString(),
        estimatedPeriod: project.estimatedPeriod,
        methodId: project.methodId,
        isBeginner: project.isBeginner,
        isDone: project.isDone,
        recruitmentStartDate: project.recruitmentStartDate.toISOString(),
        recruitmentEndDate: project.recruitmentEndDate.toISOString(),
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
      })),
    };
  }
}
