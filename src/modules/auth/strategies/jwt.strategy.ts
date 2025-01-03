import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET,
    });
  }

  async validate(payload: any): Promise<any> {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('유효하지 않은 JWT Payload 입니다');
    }
    const user = {
      userId: payload.sub,
      email: payload.email,
    };

    if (!user.userId) {
      throw new UnauthorizedException('UserId가 없습니다');
    }

    return user;
  }
}
