import { Injectable, BadRequestException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // 템플릿 파일 로드 및 변수 치환
  private async loadTemplate(templateName: string, data: Record<string, string>): Promise<string> {
    try {
      const templatePath = path.resolve(
        process.cwd(), // 현재 작업 디렉토리
        'dist',
        'modules',
        'email',
        'templates',
        `${templateName}.html`,
      );
      let template = await fs.promises.readFile(templatePath, 'utf-8');
      for (const [key, value] of Object.entries(data)) {
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(placeholder, value);
      }
      return template;
    } catch (error) {
      console.error('템플릿 로드 실패:', error);
      throw new BadRequestException('이메일 템플릿을 로드할 수 없습니다.');
    }
  }

  // 이메일 전송
  async sendEmail(
    recipient: string,
    subject: string,
    textMessage: string,
    templateName?: string,
    templateData?: Record<string, string>,
  ): Promise<void> {
    let htmlTemplate = '';
    if (templateName && templateData) {
      htmlTemplate = await this.loadTemplate(templateName, templateData);
    }

    try {
      await this.transporter.sendMail({
        from: `"DevPals" <${process.env.EMAIL_USER}>`,
        to: recipient,
        subject,
        text: textMessage,
        html: htmlTemplate,
      });
    } catch (error) {
      console.error('이메일 전송 실패:', error);
      throw new BadRequestException('이메일 전송에 실패했습니다.');
    }
  }
}
