import { Controller, Get } from '@nestjs/common';
import { MethodService } from './method.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('method')
@Controller('method')
export class MethodController {
  constructor(private methodService: MethodService) {}

  @Get()
  async getManyMethod() {
    return await this.methodService.fetchManyMethod();
  }
}
