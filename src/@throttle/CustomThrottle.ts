import { ExecutionContext, Injectable } from "@nestjs/common";
import { ThrottlerException, ThrottlerGuard } from "@nestjs/throttler";

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  async handleRequest(
    context: ExecutionContext,
    limit: number,
    ttl: number
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const keyInfo =
      request.headers["deviceid"] ||
      request.headers["authorization"] ||
      "unknown";

    const key = this.generateKey(context, keyInfo);

    const { totalHits } = await this.storageService.increment(key, ttl);

    if (totalHits > limit) {
      throw new ThrottlerException("Too many requests!.");
    }

    // await this.storageService.storage(key, ttl);
    return true;
  }
}
