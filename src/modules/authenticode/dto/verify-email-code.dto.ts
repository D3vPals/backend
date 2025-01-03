import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailCodeDto {
  @ApiProperty({
    example: 'devpals@mail.com',
    description: '사용자의 이메일 주소',
    required: true,
  })
  @IsEmail({}, { message: '유효한 이메일을 입력해주세요.' })
  email: string;

  @ApiProperty({
    example: '123456',
    description: '인증 코드',
    required: true,
  })
  @IsNotEmpty({ message: '인증 코드를 입력해주세요.' })
  @IsString()
  code: string;
}
