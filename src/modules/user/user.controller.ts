import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CheckNicknameDto } from './dto/check-nickname.dto';

@ApiTags('User')
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
  async postNicknameCheck(@Body() checkNicknameDto: CheckNicknameDto) {
    const isAvailable = await this.userService.checkNicknameAvailability(checkNicknameDto.nickname);

    if (!isAvailable) {
      throw new BadRequestException('이미 사용 중인 닉네임입니다.');
    }

    return { message: '사용 가능한 닉네임입니다.' };
  }
}
