import { Module } from '@nestjs/common';
import { CustomMailerModule } from './Mailer.module';
import { RedisModule } from './Redis.module';
import { StripeConfigModule } from './Stripe.module';
import { ThrottleModule } from './Throttle.module';
import { TypeORMModule } from './TypeOrm.module';
@Module({
  imports: [
    TypeORMModule,
    StripeConfigModule,
    ThrottleModule,
    RedisModule,
    CustomMailerModule,
  ],
})
export class CommonModule {}
