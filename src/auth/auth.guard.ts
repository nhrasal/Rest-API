import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RedisService } from 'src/@common/services/redis.service';
import { TokenPayloadReturn } from 'src/@types/token.types';
import { JWTHelper } from 'src/helper/jwt.helper';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly redis: RedisService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    const deviceId = request.headers['deviceid'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!authHeader || !token || token == null)
      throw new UnauthorizedException('No Token Added! 💔');

    const payload: TokenPayloadReturn = await getPayloadFromToken(token);

    if (!payload) throw new UnauthorizedException('Token is not valid! 💔');

    if (payload.deviceId !== deviceId)
      throw new UnauthorizedException('Unauthorized Request!');

    let tokenPayload;
    // For Access Token
    if (payload.isAccessToken)
      tokenPayload = await this.redis.get(payload.id + '-' + deviceId);
    // for RefreshToken
    if (!tokenPayload) {
      tokenPayload = await this.redis.get(payload.email + '-' + deviceId);
    }
    // token not found
    if (!tokenPayload) throw new UnauthorizedException('Unauthorized Request!');

    request.user = JSON.parse(tokenPayload);

    return request;
  }
}

async function getPayloadFromToken(token: string): Promise<any> {
  try {
    const jwtHelper = new JWTHelper();
    const payload = await jwtHelper.decodeToken(token);
    return payload;
  } catch (error) {
    throw new UnauthorizedException('Invalid Token! 💩');
  }
}
