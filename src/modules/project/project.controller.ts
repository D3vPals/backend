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

@ApiTags('project')
@Controller('project')
export class ProjectController {
  constructor(private projectService: ProjectService) {}

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
}
