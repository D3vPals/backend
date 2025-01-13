import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString
} from 'class-validator';

class SkillDto {
  @ApiProperty({ description: '스킬 이름', example: 'JavaScript' })
  skillName: string;

  @ApiProperty({ description: '스킬 이미지 URL', example: 'https://example.com/js-logo.png' })
  skillImg: string;
}

class PositionDto {
  @ApiProperty({ description: '포지션 ID', example: 2 })
  id: number;

  @ApiProperty({ description: '포지션 이름', example: '프론트엔드' })
  name: string;
}

export class CareerDto {
  @ApiProperty({ description: '회사 이름', example: 'Google' })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({ description: '시작 날짜', example: '2020-01-01' })
  @Type(() => Date)
  @IsOptional()
  periodStart: string;

  @ApiProperty({ description: '종료 날짜', example: '2022-01-01' })
  @Type(() => Date)
  @IsOptional()
  periodEnd: string;

  @ApiProperty({ description: '역할/포지션', example: 'Software Engineer' })
  @IsString()
  @IsOptional()
  role: string;
}

export class MyInfoResponseDto {
  @ApiProperty({ description: '사용자 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '사용자 닉네임', example: 'Jenny' })
  nickname: string;

  @ApiProperty({ description: '사용자 이메일', example: 'jenny@example.com' })
  email: string;

  @ApiProperty({ description: '사용자 소개 (bio)', example: '안녕하세요, 저는 프론트엔드 개발자입니다.' })
  bio: string;

  @ApiProperty({ description: '사용자 프로필 이미지 URL', example: 'https://example.com/profile.jpg' })
  profileImg: string;

  @ApiProperty({ description: '사용자 레벨', example: 'Beginner' })
  userLevel: string;

  @ApiProperty({ description: 'GitHub 링크', example: 'https://github.com/jennywithlove' })
  github: string;

  @ApiProperty({ 
    description: '사용자 경력', 
    type: [CareerDto],
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
  })
  career: CareerDto[]; // JSON 필드 반영

  @ApiProperty({
    description: '포지션 태그 정보',
    type: PositionDto,
    example: { id: 2, name: '프론트엔드' },
  })
  positionTag: PositionDto;

  @ApiProperty({
    description: '사용자의 스킬셋',
    type: [SkillDto],
    example: [
      { skillName: 'JavaScript', skillImg: 'https://example.com/js-logo.png' },
      { skillName: 'TypeScript', skillImg: 'https://example.com/TypeScript-logo.png' },
      { skillName: 'React', skillImg: 'https://example.com/react-logo.png' },
    ],
  })
  skills: SkillDto[];

  @ApiProperty({ description: '사용자 생성일', example: '2023-01-01T00:00:00.000Z' })
  createdAt: Date;
}
