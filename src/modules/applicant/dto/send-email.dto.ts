import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class SendEmailDTO {
  @ApiProperty({
    example: 1,
    description: '공고 id',
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  projectId: number;
}
