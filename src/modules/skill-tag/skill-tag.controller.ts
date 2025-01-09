import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SkillTagService } from './skill-tag.service';

@ApiTags('skill-tag')
@Controller('skill-tag')
export class SkillTagController {
  constructor(private skillTagService: SkillTagService) {}

  // GET: 스킬 태그 목록
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '스킬 태그 목록',
    description: '스킬 태그 목록을 가져옵니다.',
  })
  @ApiResponse({
    status: 200,
    description: '스킬 태그 목록 가져오기 성공',
    schema: {
      example: [
        {
          id: 1,
          name: 'JavaScript',
          img: '스킬 태그 이미지 주소',
          createdAt: '2025-01-02T15:07:03.000Z',
        },
        {
          id: 2,
          name: 'TypeScript',
          img: '스킬 태그 이미지 주소',
          createdAt: '2025-01-02T15:07:23.000Z',
        },
        {
          id: 3,
          name: 'React',
          img: '스킬 태그 이미지 주소',
          createdAt: '2025-01-02T15:07:31.000Z',
        },
        {},
      ],
    },
  })
  @Get()
  async getManySkillTag() {
    return await this.skillTagService.fetchManySkillTag();
  }
}
