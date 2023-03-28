import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';

export const DeviceId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): any => {
    const request = ctx.switchToHttp().getRequest();
    const deviceId = request.headers['deviceid'];
    if (!deviceId) throw new BadRequestException('Device Id not found');
    return deviceId || null;
  },
);
