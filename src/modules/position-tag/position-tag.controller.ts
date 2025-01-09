import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PositionTagService } from './position-tag.service';

@ApiTags('position-tag')
@Controller('position-tag')
export class PositionTagController {
  constructor(private positionTagService: PositionTagService) {}

  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '포지션 태그 목록',
    description: '포지션 태그 목록을 가져옵니다.',
  })
  @ApiResponse({
    status: 200,
    description: '포지션 태그 목록 가져오기 성공',
    schema: {
      example: [
        {
          id: 1,
          name: '백엔드',
          createdAt: '2025-01-02T12:19:48.000Z',
        },
        {
          id: 2,
          name: '프론트엔드',
          createdAt: '2025-01-02T12:19:51.000Z',
        },
        {
          id: 3,
          name: '디자이너',
          createdAt: '2025-01-02T12:19:55.000Z',
        },
        {},
      ],
    },
  })
  @Get()
  async getManyPositionTag() {
    return await this.positionTagService.fetchManyPositionTag();
  }
}
