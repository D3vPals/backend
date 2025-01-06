import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [ProjectController],
  providers: [ProjectService],
  imports: [JwtModule],
})
export class ProjectModule {}
