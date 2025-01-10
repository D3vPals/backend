import { Controller, Get, Query, InternalServerErrorException } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Test')
@Controller('test')
export class TestController {
  @Get('error')
  @ApiResponse({ status: 200, description: '정상 응답' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  triggerError(@Query('force') force: string) {
    if (force === 'true') {
      throw new InternalServerErrorException('강제로 발생한 500 에러');
    }
    return { message: '정상 동작' };
  }
}
