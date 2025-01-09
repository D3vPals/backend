import { 
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Patch,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
  UseGuards,
  InternalServerErrorException 
 } from '@nestjs/common';
 import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CurrentUser } from '../../decorators/curretUser.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CheckNicknameDto } from './dto/check-nickname.dto';
import { ApplicationStatusDto } from './dto/application-status.dto';
import { MyInfoResponseDto } from './dto/my-info-response.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Post('nickname-check')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '닉네임 중복 확인',
    description: '입력된 닉네임이 이미 사용 중인지 확인합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '닉네임 사용 가능',
    schema: {
      example: {
        message: '사용 가능한 닉네임입니다.',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (닉네임 형식 오류)',
    schema: {
      example: {
        message: ['닉네임은 반드시 입력해야 합니다.'],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '닉네임 중복',
    schema: {
      example: {
        message: '이미 사용 중인 닉네임입니다.',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  async postNicknameCheck(@Body() { nickname }: CheckNicknameDto) {
    const isAvailable = await this.userService.checkNicknameAvailability(nickname);

    if (!isAvailable) {
      throw new BadRequestException('이미 사용 중인 닉네임입니다.');
    }

    return { message: '사용 가능한 닉네임입니다.' };
  }

  @Patch('me/profile-img')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '프로필 이미지 업데이트',
    description: '사용자의 프로필 이미지를 파일 형식으로 업로드하고 업데이트합니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '업로드할 프로필 이미지 파일 (최대 5MB)',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '프로필 이미지가 성공적으로 업데이트됨',
    schema: {
      example: {
        message: '프로필 이미지가 성공적으로 업데이트되었습니다.',
        user: {
          id: 1,
          nickname: 'exampleUser',
          profileImg: 'http://example.com/new-image.png',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (파일이 첨부되지 않음)',
    schema: {
      example: {
        message: '파일이 업로드되지 않았습니다.',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    schema: {
      example: {
        statusCode: 401,
        message: '유효하지 않거나 만료된 토큰입니다.',
        error: 'Unauthorized',
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한
    }),
  )
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  async patchUpdateProfileImage(
    @CurrentUser() userId: number, // 사용자 ID 가져오기 (req.user 대체)
    @UploadedFile() file: Express.Multer.File, // 업로드된 파일 가져오기
  ) {
    if (!userId) {
      throw new BadRequestException('사용자 ID를 확인할 수 없습니다.');
    }

    if (!file) {
      throw new BadRequestException('파일이 업로드되지 않았습니다.');
    }

    const fileType = file.mimetype.split('/')[1]; // 파일 확장자 추출
    const allowedFileTypes = ['jpeg', 'png', 'jpg'];
    if (!allowedFileTypes.includes(fileType)) {
      throw new BadRequestException('허용되지 않는 파일 형식입니다.');
    }

    try {
      // 사용자 프로필 업데이트
      const updatedUser = await this.userService.updateProfileImage(
        userId,
        file.buffer,
        fileType,
      );

      return {
        message: '프로필 이미지가 성공적으로 업데이트되었습니다.',
        user: updatedUser,
      };
    } catch (error) {
      console.error('Error while updating profile image:', error);
      throw new InternalServerErrorException('프로필 이미지 업데이트 중 오류가 발생했습니다.');
    }
  }

  @Get('me/applications')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '마이페이지 지원 정보 조회',
    description: `사용자가 지원한 프로젝트 목록과 합격 여부를 반환합니다.<br>
                  지원은 했으나 불합 처리 되지 않았어도, 모집 종료시 불합격입니다. 따라서 불/합 리스트만 보입니다.`,
  })
  @ApiResponse({
    status: 200,
    description: '사용자의 지원한 프로젝트와 합격, 불합격에 따른 상태 반환',
    schema: {
      example: [
        {
          projectTitle: "클론코딩 사이드 프로젝트 팀원 모집",
          status: "ACCEPTED"
        },
        {
          projectTitle: "클론코딩 모집",
          status: "REJECTED"
        }
      ]
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    schema: {
      example: {
        statusCode: 401,
        message: '유효하지 않거나 만료된 토큰입니다.',
        error: 'Unauthorized',
      },
    },
  })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  async getApplications(@CurrentUser() userId: number): Promise<ApplicationStatusDto[]> {
    if (!userId) {
      throw new BadRequestException('사용자 ID를 확인할 수 없습니다.');
    }
  
    const applications = await this.userService.getApplicationsByUserId(userId);
  
    return applications;
  }

    // 내 정보 조회
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '내 정보 보기',
    description: '인증된 사용자의 정보를 반환하며, 포지션, 깃허브 링크, 경력, 스킬셋 등을 포함합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '사용자의 정보 반환',
    type: MyInfoResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    schema: {
      example: {
        statusCode: 401,
        message: '유효하지 않거나 만료된 토큰입니다.',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '사용자 정보가 존재하지 않을 경우',
    schema: {
      example: {
        statusCode: 404,
        message: '사용자 정보를 찾을 수 없습니다.',
        error: 'Not Found',
      },
    },
  })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  async getMyInfo(@CurrentUser() userId: number): Promise<MyInfoResponseDto> {
    return this.userService.getUserInfoWithSkills(userId);
  }
  
  // 다른 사용자 정보 조회
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '다른 사용자 정보 보기',
    description: '특정 사용자의 정보를 반환합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '사용자의 정보 반환',
    type: MyInfoResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 - 사용자 ID 형식이 잘못되었거나 누락됨',
    schema: {
      example: {
        statusCode: 400,
        message: '잘못된 사용자 ID입니다.',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '사용자 정보가 존재하지 않을 경우',
    schema: {
      example: {
        statusCode: 404,
        message: '사용자 정보를 찾을 수 없습니다.',
        error: 'Not Found',
      },
    },
  })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  async getOtherUserInfo(@Param('id') id: number): Promise<MyInfoResponseDto> {
    return this.userService.getUserInfoWithSkills(id);
  }

}
