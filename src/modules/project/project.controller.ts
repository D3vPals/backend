import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProjectService } from './project.service';
import { GetManyProjectDTO } from './dto/get-project.dto';
import { CreateProjectDTO } from './dto/create-project.dto';
import { CurrentUser } from 'src/decorators/curretUser.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ModifyProjectDTO } from './dto/modify-project.dto';

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
    await this.projectService.incrementViews(id);

    return await this.projectService.fetchProject({ id });
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post()
  async postProject(
    @CurrentUser() userId: number,
    @Body() body: CreateProjectDTO,
  ) {
    return await this.projectService.createProject({
      authorId: userId,
      data: body,
    });
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async putProject(
    @CurrentUser() userId: number,
    @Body() body: ModifyProjectDTO,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.projectService.modifyProject({
      authorId: userId,
      data: body,
      id,
    });
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async patchProjectIsDone(
    @CurrentUser() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.projectService.modifyProjectIsDone({
      authorId: userId,
      id,
    });
  }
}
