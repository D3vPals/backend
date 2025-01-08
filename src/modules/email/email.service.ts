import {
  Injectable,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ApplicantService } from '../applicant/applicant.service';

@Injectable()
export class EmailService {
  private transporter;

  constructor(
    private prismaService: PrismaService,
    @Inject(forwardRef(() => ApplicantService))
    private applicantService: ApplicantService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // 템플릿 파일 로드 및 변수 치환
  private async loadTemplate(
    templateName: string,
    data: Record<string, string>,
  ): Promise<string> {
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

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) // 매일 자정 실행
  async updateProjectsToDone() {
    const today = new Date();

    try {
      // 조건에 맞는 프로젝트 찾기
      const projectsToUpdate = await this.prismaService.project.findMany({
        where: {
          recruitmentEndDate: {
            lte: today, // 오늘 날짜와 같거나 이전 날짜
          },
          isDone: false, // 아직 완료되지 않은 프로젝트
        },
        select: {
          id: true, // 프로젝트 ID만 가져오기
        },
      });

      // 업데이트 수행
      const updatedProjectIds = projectsToUpdate.map((project) => project.id);
      await this.prismaService.project.updateMany({
        where: {
          id: {
            in: updatedProjectIds,
          },
        },
        data: {
          isDone: true,
        },
      });

      // 각 프로젝트에 대해 이메일 전송
      for (const projectId of updatedProjectIds) {
        try {
          // 대기 중인 지원자를 REJECTED 상태로 변경
          const modifyRejectPromise =
            this.applicantService.modifyApplicantReject({
              projectId,
              status: 'REJECTED',
            });

          // ACCEPTED 상태 지원자들에게 이메일 전송
          const sendAcceptedEmailsPromise =
            this.applicantService.sendEmailsToApplicantsByStatus({
              projectId,
              status: 'ACCEPTED',
            });

          // REJECTED 상태 지원자들에게 이메일 전송
          const sendRejectedEmailsPromise =
            this.applicantService.sendEmailsToApplicantsByStatus({
              projectId,
              status: 'REJECTED',
            });

          // 병렬로 처리
          await Promise.all([
            modifyRejectPromise,
            sendAcceptedEmailsPromise,
            sendRejectedEmailsPromise,
          ]);
        } catch (error) {
          console.error(`Error processing project ${projectId}:`, error);
        }
      }
    } catch (error) {
      console.error('Error updating projects:', error);
    }
  }
}
