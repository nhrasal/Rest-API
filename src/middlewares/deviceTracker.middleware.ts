import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class DeviceTracker implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const deviceId = req.headers['deviceid'] || null;

    const route = req.originalUrl.split('/').filter((x) => x != '');

    if (route.includes('public') || route.includes('devices')) {
      next();
      return;
    }

    if (!deviceId) throw new UnauthorizedException('Unauthorized device!');

    next();
  }
}
