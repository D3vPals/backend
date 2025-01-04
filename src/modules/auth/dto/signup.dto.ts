import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class SignUpDto {
  @ApiProperty({
    example: 'devpals@mail.com',
    description: '사용자의 이메일 주소',
    required: true,
  })
  @IsEmail({}, { message: '유효한 이메일을 입력해주세요.' })
  email: string;

  @ApiProperty({
    example: 'test123!',
    description: '사용자의 비밀번호',
    required: true,
  })
  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  @Length(8, 20, { message: '비밀번호는 8자 이상 20자 이하로 입력해주세요.' })
  @Matches(/^(?=.*[!@#$%^&*])/, { message: '특수문자를 포함해주세요.' })
  password: string;

  @ApiProperty({
    example: '김개발',
    description: '사용자의 닉네임',
    required: true,
  })
  @IsNotEmpty({ message: '닉네임을 입력해주세요.' })
  @IsString()
  nickname: string;
}
