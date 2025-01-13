import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray } from 'class-validator';

export class CareerDto {
  @ApiProperty({ description: '회사 이름', example: 'Google' })
  @IsString()
  name: string;

  @ApiProperty({ description: '시작 날짜', example: '2020-01-01' })
  @IsString()
  periodStart: string;

  @ApiProperty({ description: '종료 날짜', example: '2022-01-01' })
  @IsString()
  periodEnd: string;

  @ApiProperty({ description: '역할/포지션', example: 'Software Engineer' })
  @IsString()
  role: string;
}

export class UpdateUserDto {
  @ApiProperty({ description: '사용자 닉네임', example: 'newNickname' })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiProperty({ description: '사용자 소개 (bio)', example: '새로운 소개글입니다.' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ description: 'GitHub 링크', example: 'https://github.com/example' })
  @IsOptional()
  @IsString()
  github?: string;

  @ApiProperty({ description: '포지션 태그 ID', example: 2 })
  @IsOptional()
  positionTagId?: number;

  @ApiProperty({
    description: '스킬 태그 ID 배열',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  skillTagIds?: number[];

  @ApiProperty({
    description: '경력 배열',
    example: [
      {
        name: 'Google',
        periodStart: '2020-01-01',
        periodEnd: '2022-01-01',
        role: 'Software Engineer',
      },
      {
        name: 'Facebook',
        periodStart: '2018-06-01',
        periodEnd: '2019-12-31',
        role: 'Backend Developer',
      },      
    ],
    type: [CareerDto],
  })
  @IsOptional()
  @IsArray()
  career?: CareerDto[];
}
