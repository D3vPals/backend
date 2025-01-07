import { Module } from '@nestjs/common';
import { AuthenticodeController } from './authenticode.controller';
import { AuthenticodeService } from './authenticode.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [AuthenticodeController],
  providers: [AuthenticodeService]
})
export class AuthenticodeModule {}
