import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { Reflector } from '@nestjs/core';
  import { IS_PUBLIC_KEY } from '../auth.decorator';
  
  @Injectable()
  export class JwtAuthGuard implements CanActivate {
    constructor(
      private readonly jwtService: JwtService,
      private readonly reflector: Reflector,
    ) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
  
      if (isPublic) {
        return true; // 공개 엔드포인트는 가드 무시
      }
  
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers.authorization;
  
      if (!authHeader) {
        throw new UnauthorizedException('인증 토큰을 포함해주세요');
      }
  
      const token = authHeader.split(' ')[1];
  
      if (!token) {
        throw new UnauthorizedException('JWT token이 없습니다');
      }
  
      try {
        const payload = this.jwtService.verify(token, {
          secret: process.env.JWT_ACCESS_SECRET, // 수정된 부분
        });
  
        // 사용자 정보를 요청 객체에 설정
        request.user = { userId: payload.sub, email: payload.email };
        return true;
      } catch (error) {
        throw new UnauthorizedException('유효하지 않거나 만료된 토큰입니다');
      }
    }
  }
  