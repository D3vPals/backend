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
  Req,
  UseGuards,
  InternalServerErrorException 
 } from '@nestjs/common';
 import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CheckNicknameDto } from './dto/check-nickname.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log('req.user:', req.user); // 디버깅: req.user 확인
    const userId = req.user.userId; // userId 가져오기
  
    if (!userId) {
      throw new BadRequestException('사용자 ID를 확인할 수 없습니다.');
    }
  
    if (!file) {
      throw new BadRequestException('파일이 업로드되지 않았습니다.');
    }
  
    const fileType = file.mimetype.split('/')[1];
    const allowedFileTypes = ['jpeg', 'png', 'jpg'];
    if (!allowedFileTypes.includes(fileType)) {
      throw new BadRequestException('허용되지 않는 파일 형식입니다.');
    }
  
    try {
      const updatedUser = await this.userService.updateProfileImage(
        userId, // userId 전달
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

}
