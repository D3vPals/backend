import { Module } from '@nestjs/common';
import { PositionTagController } from './position-tag.controller';
import { PositionTagService } from './position-tag.service';

@Module({
  controllers: [PositionTagController],
  providers: [PositionTagService],
  exports: [PositionTagService],
})
export class PositionTagModule {}
