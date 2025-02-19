import { Controller, Get } from '@nestjs/common';
import { config } from 'dotenv';
config();

console.log(process.env.FIREBASE_APIKEY);
@Controller('config')
export class ConfigController {
  @Get()
  getConfig() {
    return {
      FIREBASE_APIKEY: process.env.FIREBASE_APIKEY,
      FIREBASE_DOMAIN: process.env.FIREBASE_DOMAIN,
      FIREBASE_PROJECTID: process.env.FIREBASE_PROJECTID,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      FIREBASE_SENDER_ID: process.env.FIREBASE_SENDER_ID,
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
    };
  }
}
