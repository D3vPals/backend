import { IsEmail, IsString } from 'class-validator';

export class InternalEmailDto {
  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요.' })
  recipient: string;

  @IsString({ message: '유효한 제목을 입력해주세요.' })
  subject: string;

  @IsString({ message: '유효한 메시지를 입력해주세요.' })
  message: string;
}
