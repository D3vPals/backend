import { ApiProperty } from '@nestjs/swagger';
import { ProjectResponseDto } from './project-response.dto';

export class UserProjectsResponseDto {
  @ApiProperty({
    description: '사용자가 참여한 프로젝트 목록',
    type: [ProjectResponseDto],
    example: [
      {
        projectId: 1,
        title: '참여한 프로젝트',
        description: '참여한 프로젝트 설명',
        totalMember: 5,
        startDate: '2025-01-01T00:00:00.000Z',
        estimatedPeriod: '3개월',
        methodId: 1,
        isBeginner: true,
        isDone: false,
        recruitmentStartDate: '2025-01-01T00:00:00.000Z',
        recruitmentEndDate: '2025-02-01T00:00:00.000Z',
        status: 'ACCEPTED',
        ProjectSkillTag: [],
        ProjectPositionTag: [],
      },
    ],
  })
  acceptedProjects: ProjectResponseDto[];

  @ApiProperty({
    description: '사용자가 기획한 프로젝트 목록',
    type: [ProjectResponseDto],
    example: [
      {
        projectId: 2,
        title: '기획한 프로젝트',
        description: '기획한 프로젝트 설명',
        totalMember: 3,
        startDate: '2025-03-01T00:00:00.000Z',
        estimatedPeriod: '6개월',
        methodId: 2,
        isBeginner: false,
        isDone: true,
        recruitmentStartDate: '2025-02-01T00:00:00.000Z',
        recruitmentEndDate: '2025-04-01T00:00:00.000Z',
        ProjectSkillTag: [],
        ProjectPositionTag: [],
      },
    ],
  })
  ownProjects: ProjectResponseDto[];
}
