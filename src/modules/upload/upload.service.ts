import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as crypto from 'crypto';

@Injectable()
export class UploadService {
  private s3: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.s3 = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
  }

  async uploadImage(
    folder: string,
    userId: number,
    fileBuffer: Buffer,
    fileType: string,
  ): Promise<string> {
    try {
      const fileName = `${folder}/profile_${crypto.randomUUID()}.${fileType}`;
      const params = {
        Bucket: this.bucketName,
        Key: fileName,
        Body: fileBuffer,
        ContentType: `image/${fileType}`,
      };

      await this.s3.send(new PutObjectCommand(params)); // v3 스타일 API 사용

      return `https://${this.bucketName}.s3.${this.configService.get<string>(
        'AWS_REGION',
      )}.amazonaws.com/${fileName}`;
    } catch (error) {
      console.error('S3 Upload Error:', error);
      throw new InternalServerErrorException('S3 업로드 중 오류 발생');
    }
  }
}
