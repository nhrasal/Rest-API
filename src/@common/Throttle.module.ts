import { Module } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";
import { ENV } from "src/ENV";

@Module({
	imports: [
		ThrottlerModule.forRoot({
			throttlers: [{ ttl: ENV.THROTTLE_TTL, limit: ENV.THROTTLE_LIMIT }],
		}),
	],
})
export class ThrottleModule {}
