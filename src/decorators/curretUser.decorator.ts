import { ExecutionContext, createParamDecorator } from '@nestjs/common';

// 토큰으로 사용자 Id 파악
export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return user.userId;
  },
);
