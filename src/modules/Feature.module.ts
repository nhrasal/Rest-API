import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { DeviceModule } from "./deviceInfo/deviceInfo.module";
import { QueueModule } from "./queues/queue.module";
import { UserModule } from "./users/users.module";
@Module({
  imports: [DeviceModule, QueueModule, UserModule, AuthModule],
})
export class FeatureModule {}
