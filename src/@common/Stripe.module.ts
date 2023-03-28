import { Module } from "@nestjs/common";
import { StripeModule } from "nestjs-stripe";
import { ENV } from "src/ENV";

@Module({
  imports: [
    StripeModule.forRoot({
      apiKey: ENV.STRIPE_API_KEY,
      apiVersion: "2022-11-15",
    }),
  ],
})
export class StripeConfigModule {}
