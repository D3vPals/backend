import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

export class ProjectDTO {
  @ApiProperty({
    example: '클론코딩 사이드 프로젝트 모집 공고',
    description: '공고 제목',
  })
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: '마크 다운 공고 내용',
  })
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 3,
    description: '모집 인원',
  })
  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  totalMember: number;

  @ApiProperty({
    example: '2025-01-25',
    description: '시작 예정일',
  })
  @IsNotEmpty()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    example: '3개월',
    description: '예상 기간',
  })
  @IsNotEmpty()
  estimatedPeriod: string;

  @ApiProperty({
    example: 1,
    description: '진행 방식 id',
  })
  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  methodId: number;

  @ApiProperty({
    example: true,
    description: '새싹 환영',
  })
  @IsBoolean()
  @IsNotEmpty()
  isBeginner: boolean;

  @ApiProperty({
    example: '2025-01-06',
    description: '모집 시작 날짜',
  })
  @IsNotEmpty()
  @Type(() => Date)
  recruitmentStartDate: Date;

  @ApiProperty({
    example: '2025-02-15',
    description: '모집 마감 날짜',
  })
  @IsNotEmpty()
  @Type(() => Date)
  recruitmentEndDate: Date;

  @ApiProperty({
    example: [1, 2],
    description: '스킬 태그',
  })
  @IsArray()
  @IsNotEmpty()
  @Transform(({ value }) =>
    Array.isArray(value) ? value.map((v) => Number(v)) : [Number(value)],
  )
  skillTagId: number[];

  @ApiProperty({
    example: [1, 2],
    description: '포지션 태그',
  })
  @IsArray()
  @IsNotEmpty()
  @Transform(({ value }) =>
    Array.isArray(value) ? value.map((v) => Number(v)) : [Number(value)],
  )
  positionTagId: number[];
}
