import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({ description: '사용자 경력', example: '2020.12.10 ~ 2022.02.04 OO기업 인턴' })
  career: string;

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
      { skillName: 'React', skillImg: 'https://example.com/react-logo.png' },
    ],
  })
  skills: SkillDto[];

  @ApiProperty({ description: '사용자 생성일', example: '2023-01-01T00:00:00.000Z' })
  createdAt: Date;
}
