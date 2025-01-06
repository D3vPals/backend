import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProjectService } from './project.service';
import { GetManyProjectDTO } from './dto/get-project.dto';
import { PostProjectDTO } from './dto/create-project.dto';
import { CurrentUser } from 'src/decorators/curretUser.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

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

  @Get(':id')
  async getProject(@Param('id', ParseIntPipe) id: number) {
    return await this.projectService.fetchProject({ id });
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post()
  async postProject(
    @CurrentUser() userId: number,
    @Body() body: PostProjectDTO,
  ) {
    return await this.projectService.createProject({
      authorId: userId,
      data: body,
    });
  }
}
