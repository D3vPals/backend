import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProjectService } from './project.service';
import { GetManyProjectDTO } from './dto/get-project.dto';
import { CreateProjectDTO } from './dto/create-project.dto';
import { CurrentUser } from 'src/decorators/curretUser.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ModifyProjectDTO } from './dto/modify-project.dto';
import { CreateApplicantDTO } from '../applicant/dto/create-applicant.dto';
import { ApplicantService } from '../applicant/applicant.service';
import { ModifyApplicantStatusDTO } from '../applicant/dto/modify-applicant-status.dto';

@ApiTags('project')
@Controller('project')
export class ProjectController {
  constructor(
    private projectService: ProjectService,
    private applicantService: ApplicantService,
  ) {}

  // GET: 공고 목록
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '공고 목록',
    description: '등록순으로 공고 목록을 보여줍니다.',
  })
  @ApiResponse({
    status: 200,
    description: '공고 목록 가져오기 성공',
    schema: {
      example: {
        projects: [
          {
            id: 68,
            title: '클론코딩 사이드 프로젝트 모집 공고',
            description: 'string',
            totalMember: 3,
            startDate: '2025-01-25T00:00:00.000Z',
            estimatedPeriod: '3개월',
            methodId: 1,
            authorId: 8,
            views: 2,
            isBeginner: true,
            isDone: true,
            recruitmentEndDate: '2025-02-15T00:00:00.000Z',
            recruitmentStartDate: '2025-01-06T00:00:00.000Z',
            createdAt: '2025-01-06T21:19:21.000Z',
            updatedAt: '2025-01-06T21:19:21.000Z',
            User: {
              id: 8,
              nickname: '김개발',
              email: 'devpals@mail.com',
              bio: null,
              profileImg: '프로필 이미지 주소',
              createdAt: '2025-01-04T06:39:31.000Z',
              updatedAt: '2025-01-08T18:15:13.000Z',
            },
            ProjectSkillTag: [
              {
                projectId: 68,
                skillTagId: 12,
                SkillTag: {
                  id: 12,
                  name: 'Kotlin',
                  img: '스킬 태그 이미지 주소',
                  createdAt: '2025-01-02T15:09:19.000Z',
                },
              },
            ],
            Method: {
              id: 1,
              name: '온라인',
              createdAt: '2025-01-02T12:36:01.000Z',
            },
            ProjectPositionTag: [
              {
                projectId: 68,
                positionTagId: 1,
                PositionTag: {
                  id: 1,
                  name: '백엔드',
                  createdAt: '2025-01-02T12:19:48.000Z',
                },
              },
              {
                projectId: 68,
                positionTagId: 2,
                PositionTag: {
                  id: 2,
                  name: '프론트엔드',
                  createdAt: '2025-01-02T12:19:51.000Z',
                },
              },
            ],
          },
          {},
        ],
        total: 67,
        currentPage: 1,
        lastPage: 6,
      },
    },
  })
  @Get()
  async getManyProject(@Query() query: GetManyProjectDTO) {
    return await this.projectService.fetchManyProject(query);
  }

  // GET: 공고 목록 개수(진행/마감/전체)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '진행중 / 마감 / 전체 공고 개수',
    description: '진행중 / 마감 / 전체 공고 개수를 보여줍니다.',
  })
  @ApiResponse({
    status: 200,
    description: '공고 개수 가져오기 성공',
    schema: {
      example: {
        ongoingProjectCount: 63,
        endProjectCount: 4,
        totalProjectCount: 67,
      },
    },
  })
  @Get('count')
  async getProjectCount() {
    return await this.projectService.fetchProjectCount();
  }

  // GET: 본인이 등록한 공고 목록
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '기획자가 등록한 공고 목록',
    description: '기획자(본인)가 등록한 공고 목록을 등록순으로 보여줍니다.',
  })
  @ApiResponse({
    status: 200,
    description: '공고 목록 가져오기 성공',
    schema: {
      example: [
        {
          id: 68,
          title: '클론코딩 사이드 프로젝트 모집 공고',
          description: 'string',
          totalMember: 3,
          startDate: '2025-01-25T00:00:00.000Z',
          estimatedPeriod: '3개월',
          methodId: 1,
          authorId: 8,
          views: 2,
          isBeginner: true,
          isDone: true,
          recruitmentEndDate: '2025-02-15T00:00:00.000Z',
          recruitmentStartDate: '2025-01-06T00:00:00.000Z',
          createdAt: '2025-01-06T21:19:21.000Z',
          updatedAt: '2025-01-06T21:19:21.000Z',
          ProjectSkillTag: [
            {
              projectId: 68,
              skillTagId: 12,
              SkillTag: {
                id: 12,
                name: 'Kotlin',
                img: '스킬 태그 이미지 주소',
                createdAt: '2025-01-02T15:09:19.000Z',
              },
            },
          ],
          ProjectPositionTag: [
            {
              projectId: 68,
              positionTagId: 1,
              PositionTag: {
                id: 1,
                name: '백엔드',
                createdAt: '2025-01-02T12:19:48.000Z',
              },
            },
            {
              projectId: 68,
              positionTagId: 2,
              PositionTag: {
                id: 2,
                name: '프론트엔드',
                createdAt: '2025-01-02T12:19:51.000Z',
              },
            },
          ],
        },
        {},
      ],
    },
  })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getManyMyProject(@CurrentUser() userId: number) {
    return await this.projectService.fetchManyMyProject({
      authorId: userId,
    });
  }

  // GET: 공고 상세보기
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '공고 상세보기',
    description: '공고를 상세히 보여줍니다.',
  })
  @ApiResponse({
    status: 200,
    description: '공고 상세보기 성공',
    schema: {
      example: {
        id: 10,
        title: '클론코딩 사이드 프로젝트 모집 공고',
        description: 'string',
        totalMember: 3,
        startDate: '2025-01-25T00:00:00.000Z',
        estimatedPeriod: '3개월',
        methodId: 1,
        authorId: 8,
        views: 1,
        isBeginner: true,
        isDone: false,
        recruitmentEndDate: '2025-02-15T00:00:00.000Z',
        recruitmentStartDate: '2025-01-06T00:00:00.000Z',
        createdAt: '2025-01-06T07:05:01.000Z',
        updatedAt: '2025-01-06T07:05:01.000Z',
        User: {
          id: 8,
          nickname: '김개발',
          email: 'devpals@mail.com',
          bio: null,
          profileImg: '프로필 이미지 주소',
          createdAt: '2025-01-04T06:39:31.000Z',
          updatedAt: '2025-01-08T18:15:13.000Z',
        },
        ProjectSkillTag: [
          {
            projectId: 10,
            skillTagId: 1,
            SkillTag: {
              id: 1,
              name: 'JavaScript',
              img: '스킬 태그 이미지 주소',
              createdAt: '2025-01-02T15:07:03.000Z',
            },
          },
          {
            projectId: 10,
            skillTagId: 2,
            SkillTag: {
              id: 2,
              name: 'TypeScript',
              img: '스킬 태그 이미지 주소',
              createdAt: '2025-01-02T15:07:23.000Z',
            },
          },
        ],
        Method: {
          id: 1,
          name: '온라인',
          createdAt: '2025-01-02T12:36:01.000Z',
        },
        ProjectPositionTag: [
          {
            projectId: 10,
            positionTagId: 1,
            PositionTag: {
              id: 1,
              name: '백엔드',
              createdAt: '2025-01-02T12:19:48.000Z',
            },
          },
          {
            projectId: 10,
            positionTagId: 2,
            PositionTag: {
              id: 2,
              name: '프론트엔드',
              createdAt: '2025-01-02T12:19:51.000Z',
            },
          },
        ],
        Applicant: [],
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
  @Get(':id')
  async getProject(@Param('id', ParseIntPipe) id: number) {
    await this.projectService.incrementViews(id);

    return await this.projectService.fetchProject({ id });
  }

  // POST: 공고 등록
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '공고 등록하기',
    description: '공고를 생성합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '공고 등록 성공',
    schema: {
      example: {
        id: 10,
        title: '클론코딩 사이드 프로젝트 모집 공고',
        description: 'string',
        totalMember: 3,
        startDate: '2025-01-25T00:00:00.000Z',
        estimatedPeriod: '3개월',
        methodId: 1,
        authorId: 8,
        views: 0,
        isBeginner: true,
        isDone: false,
        recruitmentEndDate: '2025-02-15T00:00:00.000Z',
        recruitmentStartDate: '2025-01-06T00:00:00.000Z',
        createdAt: '2025-01-06T07:05:01.000Z',
        updatedAt: '2025-01-06T07:05:01.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '스킬 태그가 존재하지 않을 경우',
    schema: {
      example: {
        message: '해당 스킬 태그 존재하지 않습니다.',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '포지션 태그가 존재하지 않을 경우',
    schema: {
      example: {
        message: '해당 포지션 태그 존재하지 않습니다.',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '진행 방식이 존재하지 않을 경우',
    schema: {
      example: {
        message: '해당 진행 방식은 존재하지 않습니다.',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post()
  async postProject(
    @CurrentUser() userId: number,
    @Body() body: CreateProjectDTO,
  ) {
    return await this.projectService.createProject({
      authorId: userId,
      data: body,
    });
  }

  // PUT: 공고 수정
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '공고 수정하기',
    description: '기획자(본인)가 공고를 수정합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '공고 수정 성공',
    schema: {
      example: {
        id: 10,
        title: '클론코딩 사이드 프로젝트 모집 공고',
        description: 'string',
        totalMember: 3,
        startDate: '2025-01-25T00:00:00.000Z',
        estimatedPeriod: '3개월',
        methodId: 1,
        authorId: 8,
        views: 0,
        isBeginner: true,
        isDone: false,
        recruitmentEndDate: '2025-02-15T00:00:00.000Z',
        recruitmentStartDate: '2025-01-06T00:00:00.000Z',
        createdAt: '2025-01-06T07:05:01.000Z',
        updatedAt: '2025-01-06T07:05:01.000Z',
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
    description: '스킬 태그가 존재하지 않을 경우',
    schema: {
      example: {
        message: '해당 스킬 태그 존재하지 않습니다.',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '포지션 태그가 존재하지 않을 경우',
    schema: {
      example: {
        message: '해당 포지션 태그 존재하지 않습니다.',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '진행 방식이 존재하지 않을 경우',
    schema: {
      example: {
        message: '해당 진행 방식은 존재하지 않습니다.',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async putProject(
    @CurrentUser() userId: number,
    @Body() body: ModifyProjectDTO,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.projectService.modifyProject({
      authorId: userId,
      data: body,
      id,
    });
  }

  // PATCH: 공고 모집 종료
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '공고 모집 종료',
    description: '기획자(본인)가 공고 모집을 종료합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '공고 모집 종료 성공',
    schema: {
      example: {
        id: 10,
        title: '클론코딩 사이드 프로젝트 모집 공고',
        description: 'string',
        totalMember: 3,
        startDate: '2025-01-25T00:00:00.000Z',
        estimatedPeriod: '3개월',
        methodId: 1,
        authorId: 8,
        views: 0,
        isBeginner: true,
        isDone: true,
        recruitmentEndDate: '2025-02-15T00:00:00.000Z',
        recruitmentStartDate: '2025-01-06T00:00:00.000Z',
        createdAt: '2025-01-06T07:05:01.000Z',
        updatedAt: '2025-01-06T07:05:01.000Z',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: '해당 공고 작성자(기획자)가 아닌 경우',
    schema: {
      example: {
        message: '기획자만 모집을 종료할 수 있습니다.',
        error: 'Forbidden',
        statusCode: 403,
      },
    },
  })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Patch(':id/is-done')
  async patchProjectIsDone(
    @CurrentUser() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.projectService.modifyProjectIsDone({
      authorId: userId,
      id,
    });
  }

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
        career: '경력 사항/ 수상 이력',
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
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post(':id/applicant')
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
              {},
            ],
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
  @Get(':id/applicant')
  async getApplicant(
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
  @Get(':id/applicant/summary')
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
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Patch(':projectId/applicant/:applicantId/status')
  async patchApplicantByStatus(
    @CurrentUser() userId: number,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('applicantId', ParseIntPipe) applicantId: number,
    @Body() { status }: ModifyApplicantStatusDTO,
  ) {
    return await this.applicantService.modifyApplicantStatus({
      authorId: userId,
      projectId,
      userId: applicantId,
      status,
    });
  }
}
