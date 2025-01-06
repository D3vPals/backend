import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class SendEmailCodeDto {
  @ApiProperty({
    example: 'devpals@mail.com',
    description: '사용자의 이메일 주소',
    required: true,
  })
  @IsEmail({}, { message: '유효한 이메일을 입력해주세요.' })
  email: string;
}
