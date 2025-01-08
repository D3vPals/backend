import { forwardRef, Module } from '@nestjs/common';
import { AuthenticodeController } from './authenticode.controller';
import { AuthenticodeService } from './authenticode.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [forwardRef(() => EmailModule)],
  controllers: [AuthenticodeController],
  providers: [AuthenticodeService],
})
export class AuthenticodeModule {}
