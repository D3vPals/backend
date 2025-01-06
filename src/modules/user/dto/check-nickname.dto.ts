import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckNicknameDto {
  @ApiProperty({
    description: '확인할 닉네임',
    example: 'devpals',
  })
  @IsNotEmpty({ message: '닉네임은 반드시 입력해야 합니다.' })
  @IsString({ message: '닉네임은 문자여야 합니다.' })
  nickname: string;
}
