import { Module } from '@nestjs/common';
import { NotiController } from './noti.controller';
import { NotiService } from './noti.service';

@Module({
  controllers: [NotiController],
  providers: [NotiService],
  exports: [NotiService],
})
export class NotiModule {}
