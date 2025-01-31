import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Param,
  ParseIntPipe,
  Patch,
  Get,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApplicantService } from './applicant.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../../decorators/curretUser.decorator';
import { ModifyApplicantStatusDTO } from './dto/modify-applicant-status.dto';
import { CreateApplicantDTO } from './dto/create-applicant.dto';

@ApiTags('applicant')
@Controller('project/:id/applicant')
export class ApplicantController {
  constructor(private readonly applicantService: ApplicantService) {}

  // POST: 공고 지원
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '공고 지원하기',
    description: '지원자가 공고를 지원합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '공고 지원하기 성공',
    schema: {
      example: {
        id: 9,
        userId: 8,
        projectId: 68,
        message: '기획자에게 하고 싶은 말',
        email: 'devpals@mail.com',
        phoneNumber: '010-0000-0000',
        career: [
          {
            name: 'string',
            periodStart: '2025-01-10',
            periodEnd: '2025-01-10',
            role: 'string',
          },
        ],
        status: 'WAITING',
        createdAt: '2025-01-09T00:34:03.000Z',
        updatedAt: '2025-01-09T00:34:03.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '0 또는 숫자로 입력하지 않았을 경우',
    schema: {
      example: {
        message: 'Invalid ID: ID must be a valid number and not 0.',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '공고가 존재하지 않을 경우',
    schema: {
      example: {
        message: '해당 공고는 존재하지 않습니다.',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: '본인이 등록한 공고에 지원할 경우',
    schema: {
      example: {
        message: '본인이 등록한 공고에 지원할 수 없습니다.',
        error: 'Forbidden',
        statusCode: 403,
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: '이미 지원한 공고에 지원할 경우',
    schema: {
      example: {
        message: '이미 지원한 공고입니다.',
        error: 'Conflict',
        statusCode: 409,
      },
    },
  })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post()
  async postApplicant(
    @CurrentUser() userId: number,
    @Body() body: CreateApplicantDTO,
    @Param('id', ParseIntPipe) projectId: number,
  ) {
    return await this.applicantService.createApplicant({
      userId,
      projectId,
      data: body,
    });
  }

  // GET: 해당 공고 지원자 목록
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '공고 지원자 목록',
    description: '관리자(본인)가 지원자 목록을 확인합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '공고 지원자 목록 가져오기 성공',
    schema: {
      example: [
        {
          id: 7,
          userId: 8,
          projectId: 6,
          message: '기획자에게 하고 싶은 말',
          email: 'devpals@mail.com',
          phoneNumber: '010-9999-0000',
          career: null,
          status: 'REJECTED',
          createdAt: '2025-01-08T17:54:43.000Z',
          updatedAt: '2025-01-09T09:01:59.000Z',
          User: {
            id: 8,
            nickname: '김개발',
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 403,
    description: '해당 공고 작성자(기획자)가 아닌 경우',
    schema: {
      example: {
        message: '해당 공고의 기획자만 조회 가능합니다.',
        error: 'Forbidden',
        statusCode: 403,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '해당 공고가 없는 경우',
    schema: {
      example: {
        message: '해당 공고는 존재하지 않습니다.',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get()
  async getManyApplicant(
    @CurrentUser() userId: number,
    @Param('id', ParseIntPipe) projectId: number,
  ) {
    return await this.applicantService.fetchManyApplicant({
      authorId: userId,
      projectId,
    });
  }

  // GET: 해당 공고 합격자/불합격자 목록
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '공고 합격자/불합격자 목록',
    description: '관리자(본인)가 합격자/불합격자 목록을 확인합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '공고 합격자/불합격자 목록 가져오기 성공',
    schema: {
      example: {
        accepted: [
          {
            id: 7,
            userId: 8,
            projectId: 6,
            message: '기획자에게 하고 싶은 말',
            email: 'devpals@mail.com',
            phoneNumber: '010-0000-0000',
            career: null,
            status: 'ACCEPTED',
            createdAt: '2025-01-08T17:54:43.000Z',
            updatedAt: '2025-01-09T10:07:20.000Z',
            User: {
              id: 8,
              nickname: '김개발',
              email: 'devpals@mail.com',
              bio: null,
              profileImg: '프로필 이미지 주소',
              UserSkillTag: [
                {
                  userId: 8,
                  skillTagId: 28,
                  createdAt: '2025-01-08T11:57:17.000Z',
                  SkillTag: {
                    id: 28,
                    name: 'Figma',
                    img: '스킬 태그 이미지 주소',
                    createdAt: '2025-01-02T15:11:15.000Z',
                  },
                },
              ],
            },
          },
        ],
        rejected: [],
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: '해당 공고 작성자(기획자)가 아닌 경우',
    schema: {
      example: {
        message: '해당 공고의 기획자만 조회 가능합니다.',
        error: 'Forbidden',
        statusCode: 403,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '해당 공고가 없는 경우',
    schema: {
      example: {
        message: '해당 공고는 존재하지 않습니다.',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get('summary')
  async getApplicantByStatus(
    @CurrentUser() userId: number,
    @Param('id', ParseIntPipe) projectId: number,
  ) {
    return await this.applicantService.fetchApplicantByStatus({
      authorId: userId,
      projectId,
    });
  }

  // PATCH: 합격/불합격/대기 상태 선택
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '지원자 상태 변경',
    description: '관리자(본인)가 지원자의 상태를 변경합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '지원자의 상태 변경 성공',
    schema: {
      example: {
        id: 7,
        userId: 8,
        projectId: 6,
        message: '기획자에게 하고 싶은 말',
        email: 'devpals@mail.com',
        phoneNumber: null,
        career: null,
        status: 'REJECTED',
        createdAt: '2025-01-08T17:54:43.000Z',
        updatedAt: '2025-01-09T10:48:35.000Z',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: '해당 공고 작성자(기획자)가 아닌 경우',
    schema: {
      example: {
        message: '기획자만 수정 가능합니다.',
        error: 'Forbidden',
        statusCode: 403,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '해당 공고가 없는 경우',
    schema: {
      example: {
        message: '해당 공고는 존재하지 않습니다.',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '해당 지원자가 없는 경우',
    schema: {
      example: {
        message: '지원자를 찾을 수 없습니다.',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '같은 상태로 바꾸려고 하는 경우',
    schema: {
      example: {
        message: '상태가 이미 동일합니다.',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '모집 마감을 한 공고인 경우',
    schema: {
      example: {
        message: '마감한 공고는 지원자의 상태를 변경할 수 없습니다.',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Patch(':applicantUserId/status')
  async patchApplicantByStatus(
    @CurrentUser() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Param('applicantUserId', ParseIntPipe) applicantUserId: number,
    @Body() { status }: ModifyApplicantStatusDTO,
  ) {
    return await this.applicantService.modifyApplicantStatus({
      authorId: userId,
      projectId: id,
      userId: applicantUserId,
      status,
    });
  }

  // GET: 지원자 상세 보기
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '공고 지원자 상세보기',
    description: '관리자(본인)가 지원자 정보를 확인합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '공고 지원자 정보 가져오기 성공',
    schema: {
      example: {
        id: 7,
        userId: 8,
        projectId: 6,
        message: '하고싶은말',
        email: '',
        phoneNumber: '010-1111-1111',
        career: [
          {
            name: 'string',
            role: 'string',
            periodEnd: 'string',
            periodStart: 'string',
          },
        ],
        status: 'REJECTED',
        createdAt: '2025-01-08T17:54:43.000Z',
        updatedAt: '2025-01-10T09:29:06.000Z',
        User: {
          id: 8,
          nickname: '김개발데브',
          email: 'devpals@mail.com',
          bio: '새로운 소개글입니다.',
          profileImg: '프로필이미지',
          UserSkillTag: [
            {
              userId: 8,
              skillTagId: 1,
              createdAt: '2025-01-13T09:26:01.000Z',
              SkillTag: {
                id: 1,
                name: 'JavaScript',
                img: '스킬태그이미지',
                createdAt: '2025-01-02T15:07:03.000Z',
              },
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: '해당 공고 작성자(기획자)가 아닌 경우',
    schema: {
      example: {
        message: '해당 공고의 기획자만 조회 가능합니다.',
        error: 'Forbidden',
        statusCode: 403,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '해당 공고가 없는 경우',
    schema: {
      example: {
        message: '해당 공고는 존재하지 않습니다.',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get(':applicantUserId')
  async getApplicant(
    @CurrentUser() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Param('applicantUserId', ParseIntPipe) applicantUserId: number,
  ) {
    return await this.applicantService.fetchApplicant({
      authorId: userId,
      projectId: id,
      applicantUserId,
    });
  }
}
