import { ApiProperty } from '@nestjs/swagger';

export class ApplicationStatusDto {
  @ApiProperty({
    description: '프로젝트 제목',
    example: '클론코딩 사이드 프로젝트 팀원 모집',
  })
  projectTitle: string;

  @ApiProperty({
    description: '지원 상태 (WAITING/ACCEPTED/REJECTED)',
    example: 'ACCEPTED',
  })
  status: string;
}