import { ApiProperty } from '@nestjs/swagger';


export class SkillTagDto {
  @ApiProperty({ description: '스킬 태그 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '스킬 태그 이름', example: 'JavaScript' })
  name: string;

  @ApiProperty({ description: '스킬 이미지 URL', example: 'https://example.com/js-logo.png' })
  img: string;
}

export class ProjectSkillTagDto {
  @ApiProperty({ description: '프로젝트 ID', example: 10 })
  projectId: number;

  @ApiProperty({ description: '스킬 태그 ID', example: 1 })
  skillTagId: number;

  @ApiProperty({ description: '스킬 태그', type: SkillTagDto })
  SkillTag: SkillTagDto;
}

export class PositionTagDto {
  @ApiProperty({ description: '포지션 태그 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '포지션 태그 이름', example: '백엔드' })
  name: string;
}


export class ProjectPositionTagDto {
  @ApiProperty({ description: '프로젝트 ID', example: 10 })
  projectId: number;

  @ApiProperty({ description: '포지션 태그 ID', example: 1 })
  positionTagId: number;

  @ApiProperty({ description: '포지션 태그', type: PositionTagDto })
  PositionTag: PositionTagDto;
}

export class ProjectResponseDto {
  @ApiProperty({ description: '프로젝트 ID', example: 10 })
  projectId: number;

  @ApiProperty({ description: '프로젝트 제목', example: '클론코딩 사이드 프로젝트 모집 공고' })
  title: string;

  @ApiProperty({ description: '프로젝트 설명', example: 'string' })
  description: string;

  @ApiProperty({
    example: 3,
    description: '모집 인원',
  })
  totalMember: number;

  @ApiProperty({ description: '프로젝트 시작 날짜', example: '2025-01-25T00:00:00.000Z' })
  startDate: string;

  @ApiProperty({ description: '예상 기간', example: '3개월' })
  estimatedPeriod: string;

  @ApiProperty({ description: '초보자 참여 가능 여부', example: true })
  isBeginner: boolean;

  @ApiProperty({ description: '진행 방식 ID', example: 1 })
  methodId: number;

  @ApiProperty({ description: '모집 시작 날짜', example: '2025-01-06T00:00:00.000Z' })
  recruitmentStartDate: string;

  @ApiProperty({ description: '모집 마감 날짜', example: '2025-02-15T00:00:00.000Z' })
  recruitmentEndDate: string;

  @ApiProperty({ description: '지원 상태', example: 'ACCEPTED' })
  status: string;

  @ApiProperty({ description: '프로젝트 스킬 태그 목록', type: [ProjectSkillTagDto] })
  ProjectSkillTag: ProjectSkillTagDto[];

  @ApiProperty({ description: '프로젝트 포지션 태그 목록', type: [ProjectPositionTagDto] })
  ProjectPositionTag: ProjectPositionTagDto[];
}

