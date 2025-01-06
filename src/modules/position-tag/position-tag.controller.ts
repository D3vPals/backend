import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PositionTagService } from './position-tag.service';

@ApiTags('position-tag')
@Controller('position-tag')
export class PositionTagController {
  constructor(private positionTagService: PositionTagService) {}

  @Get()
  async getManyPositionTag() {
    return await this.positionTagService.fetchManyPositionTag();
  }
}
