import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class ModifyApplicantStatusDTO {
  @ApiProperty({
    enum: ['ACCEPTED', 'REJECTED', 'WAITING'],
    description: '합격/불합격/대기 상태 선택',
  })
  @IsEnum(['ACCEPTED', 'REJECTED', 'WAITING'])
  @IsNotEmpty()
  status: 'ACCEPTED' | 'REJECTED' | 'WAITING';
}
