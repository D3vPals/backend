import { ApiProperty } from '@nestjs/swagger';

export class GetAcceptedProjectsDto {
  @ApiProperty({
    description: '유저 ID (유저 조회 페이지에서 사용)',
    example: 1,
    required: false,
  })
  userId?: number;
}
