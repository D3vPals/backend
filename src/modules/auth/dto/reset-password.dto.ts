import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'devpals@mail.com',
    description: '사용자의 이메일 주소',
    required: true,
  })
  @IsEmail({}, { message: '유효한 이메일을 입력해주세요.' })
  email: string;

  @ApiProperty({
    example: 'newPass123!',
    description: '새로운 비밀번호',
    required: true,
  })
  @IsNotEmpty({ message: '새로운 비밀번호를 입력해주세요.' })
  @Length(8, 20, { message: '비밀번호는 8자 이상 20자 이하로 입력해주세요.' })
  newPassword: string;
}
