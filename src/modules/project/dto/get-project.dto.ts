import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class GetManyProjectDTO {
  @ApiProperty({
    example: [1, 2],
    description: '스킬 태그',
    required: false,
    type: [Number],
  })
  @IsArray()
  @IsOptional()
  @Transform(({ value }) =>
    Array.isArray(value) ? value.map((v) => Number(v)) : [Number(value)],
  )
  skillTag?: number[];

  @ApiProperty({
    example: 1,
    description: '포지션 태그',
    required: false,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  positionTag?: number;

  @ApiProperty({
    example: 1,
    description: '진행 방식',
    required: false,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  methodId?: number;

  @ApiProperty({
    example: true,
    description: '새싹 가능',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === null || value === undefined || value === '') return null;
  })
  isBeginner?: boolean;

  @ApiProperty({
    example: '공고 제목, 설명',
    description: '공고 제목 또는 설명 검색',
    required: false,
  })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiProperty({
    example: 1,
    description: '페이지 번호',
    required: true,
  })
  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  page: number;
}
