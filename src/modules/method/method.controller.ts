import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { MethodService } from './method.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('method')
@Controller('method')
export class MethodController {
  constructor(private methodService: MethodService) {}

  // GET: 진행 방식 목록
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '진행 방식 목록',
    description: '진행 방식 목록을 가져옵니다.',
  })
  @ApiResponse({
    status: 200,
    description: '진행 방식 목록 가져오기 성공',
    schema: {
      example: [
        {
          id: 1,
          name: '온라인',
          createdAt: '2025-01-02T12:36:01.000Z',
        },
        {
          id: 2,
          name: '오프라인',
          createdAt: '2025-01-02T12:36:07.000Z',
        },
        {
          id: 3,
          name: '온/오프라인',
          createdAt: '2025-01-02T12:36:10.000Z',
        },
      ],
    },
  })
  @Get()
  async getManyMethod() {
    return await this.methodService.fetchManyMethod();
  }
}
