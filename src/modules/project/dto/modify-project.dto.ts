import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class ModifyProjectDTO {
  @ApiProperty({
    example: '클론코딩 사이드 프로젝트 모집 공고',
    description: '공고 제목',
  })
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: '마크 다운 공고 내용',
  })
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 3,
    description: '모집 인원',
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  totalMember?: number;

  @ApiProperty({
    example: '2025-01-25',
    description: '시작 예정일',
  })
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @ApiProperty({
    example: '3개월',
    description: '예상 기간',
  })
  @IsOptional()
  estimatedPeriod?: string;

  @ApiProperty({
    example: 1,
    description: '진행 방식 id',
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  methodId?: number;

  @ApiProperty({
    example: true,
    description: '새싹 환영',
  })
  @IsBoolean()
  @IsOptional()
  isBeginner?: boolean;

  @ApiProperty({
    example: '2025-01-06',
    description: '모집 시작 날짜',
  })
  @IsOptional()
  @Type(() => Date)
  recruitmentStartDate?: Date;

  @ApiProperty({
    example: '2025-02-15',
    description: '모집 마감 날짜',
  })
  @IsOptional()
  @Type(() => Date)
  recruitmentEndDate?: Date;

  @ApiProperty({
    example: [1, 2],
    description: '스킬 태그',
  })
  @IsArray()
  @IsOptional()
  @Transform(({ value }) =>
    Array.isArray(value) ? value.map((v) => Number(v)) : [Number(value)],
  )
  skillTagId?: number[];

  @ApiProperty({
    example: [1, 2],
    description: '포지션 태그',
  })
  @IsArray()
  @IsOptional()
  @Transform(({ value }) =>
    Array.isArray(value) ? value.map((v) => Number(v)) : [Number(value)],
  )
  positionTagId?: number[];
}
