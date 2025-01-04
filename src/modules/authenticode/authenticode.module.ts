import { Module } from '@nestjs/common';
import { AuthenticodeController } from './authenticode.controller';
import { AuthenticodeService } from './authenticode.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [AuthenticodeController],
  providers: [AuthenticodeService, PrismaService]
})
export class AuthenticodeModule {}
