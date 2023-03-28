import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { CommonModule } from "./@common/Common.module";
import { RedisService } from "./@common/services/redis.service";
import { AllExceptionsFilter } from "./@exceptions/AllExceptionsFilter";
import { ResponseInterceptor } from "./@interceptors/response.interceptor";
import { BaseLogger } from "./@logger/Base.logger";
import { CustomThrottlerGuard } from "./@throttle/CustomThrottle";
import { DeviceTracker } from "./middlewares/deviceTracker.middleware";
import { FeatureModule } from "./modules/Feature.module";

@Module({
  imports: [CommonModule, FeatureModule],
  controllers: [],
  providers: [
    RedisService,
    BaseLogger,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(DeviceTracker).forRoutes("*");
  }
}
