/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { RedisService } from 'src/@common/services/redis.service';
import { FireBaseHttp } from 'src/http/firebaseHttp.service';
import { DeviceModule } from '../deviceInfo/deviceInfo.module';
import { QueueModule } from '../queues/queue.module';
import { UserModule } from '../users/users.module';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
const SERVICES = [AuthService];
const CONTROLLERS = [AuthController];
const ENTITIES = [];

@Module({
  imports: [UserModule, DeviceModule, QueueModule],
  providers: [...SERVICES, ...CONTROLLERS, RedisService, FireBaseHttp],
  controllers: [...CONTROLLERS],
  exports: [...SERVICES, ...CONTROLLERS],
})
export class AuthModule {}
