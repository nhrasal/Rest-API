import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

export class RedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}
  async set(key: string, payload: any, exSeconds?: number): Promise<any> {
    if (exSeconds)
      return await this.redis.set(
        key,
        JSON.stringify(payload),
        'EX',
        exSeconds,
      );
    return await this.redis.set(key, JSON.stringify(payload));
  }
  async get(key: string): Promise<any> {
    return await this.redis.get(key);
  }
  async remove(key: string): Promise<any> {
    return await this.redis.del(key);
  }
}
