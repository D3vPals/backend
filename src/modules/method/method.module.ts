import { Module } from '@nestjs/common';
import { MethodController } from './method.controller';
import { MethodService } from './method.service';

@Module({
  controllers: [MethodController],
  providers: [MethodService],
  exports: [MethodService],
})
export class MethodModule {}
