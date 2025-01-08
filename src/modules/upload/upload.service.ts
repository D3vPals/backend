import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import * as crypto from 'crypto';

@Injectable()
export class UploadService {
  private s3: S3;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.s3 = new S3({
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
      region: this.configService.get<string>('AWS_REGION'),
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
      const uploadResult = await this.s3
        .upload({
          Bucket: this.bucketName,
          Key: fileName,
          Body: fileBuffer,
          ContentType: `image/${fileType}`,
        })
        .promise();

      return uploadResult.Location;
    } catch (error) {
      console.error('S3 Upload Error:', error);
      throw new InternalServerErrorException('S3 업로드 중 오류 발생');
    }
  }
}
