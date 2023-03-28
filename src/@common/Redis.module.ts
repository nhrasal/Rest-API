import { Module } from '@nestjs/common';

import { RedisModule as RModule } from '@nestjs-modules/ioredis';
import { ENV } from 'src/ENV';

@Module({
  imports: [
    RModule.forRoot({
      config: {
        url: `redis://${ENV.Redis.host}:${ENV.Redis.port}`,
      },
    }),
  ],
})
export class RedisModule {}
