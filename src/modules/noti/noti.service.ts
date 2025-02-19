import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
const serviceAccount = require('../../../firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const messaging = admin.messaging();

@Injectable()
export class NotiService {
  async sendNotification(fcmToken: string, message: string) {
    const payload = {
      notification: {
        title: '새로운 지원이 도착했어요!',
        body: message,
      },
      token: fcmToken,
    };

    try {
      const response = await admin.messaging().send(payload);
      console.log('✅ 푸시 알림 전송 성공:', response);
      return { success: true, response };
    } catch (error) {
      console.error('❌ 푸시 알림 전송 실패:', error);
      return { success: false, error };
    }
  }
}
