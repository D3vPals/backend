import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateApplicantDTO {
  @ApiProperty({
    example: 'devpals@mail.com',
    description: '지원자 이메일 주소',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '010-0000-0000',
    description: '지원자 휴대폰 번호',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    example: '하고 싶은 말',
    description: '뽑아주세요.',
  })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty({
    description: '경력사항/수상이력',
  })
  @IsString()
  @IsOptional()
  career?: string;
}
