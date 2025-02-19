import { Controller, Post, Body } from '@nestjs/common';
import { NotiService } from './noti.service';

@Controller('noti')
export class NotiController {
  constructor(private readonly notiService: NotiService) {}

  // ✅ 지원 신청 시 바로 FCM 푸시 알림 전송
  @Post('send-noti')
  async sendNotification(
    @Body() { fcmToken, message }: { fcmToken: string; message: string },
  ) {
    return await this.notiService.sendNotification(fcmToken, message);
  }
}
