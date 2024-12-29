import { Module } from '@nestjs/common';
import { AuthenticodeController } from './authenticode.controller';
import { AuthenticodeService } from './authenticode.service';

@Module({
  controllers: [AuthenticodeController],
  providers: [AuthenticodeService]
})
export class AuthenticodeModule {}
