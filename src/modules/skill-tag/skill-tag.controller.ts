import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkillTagService } from './skill-tag.service';

@ApiTags('skill-tag')
@Controller('skill-tag')
export class SkillTagController {
  constructor(private skillTagService: SkillTagService) {}

  @Get()
  async getManySkillTag() {
    return await this.skillTagService.fetchManySkillTag();
  }
}
