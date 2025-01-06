import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProjectService } from './project.service';
import { GetManyProjectDTO } from './dto/get-project.dto';

@ApiTags('project')
@Controller('project')
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @Get()
  async getManyProject(@Query() query: GetManyProjectDTO) {
    return await this.projectService.fetchManyProject(query);
  }

  @Get('count')
  async getProjectCount() {
    return await this.projectService.fetchProjectCount();
  }
}
