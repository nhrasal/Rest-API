/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisService } from 'src/@common/services/redis.service';
import { DeviceInfoController } from './deviceInfo.controller';
import { DeviceEntity } from './deviceInfo.entity';
import { DeviceInfoService } from './deviceInfo.service';
const SERVICES = [DeviceInfoService];
const CONTROLLERS = [DeviceInfoController];
const ENTITIES = [DeviceEntity];

@Module({
  imports: [TypeOrmModule.forFeature([...ENTITIES])],
  providers: [...SERVICES, ...CONTROLLERS, RedisService],
  controllers: [...CONTROLLERS],
  exports: [...SERVICES, ...CONTROLLERS],
})
export class DeviceModule {}
