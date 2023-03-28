import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundResponse } from 'src/@responses/notfound.response';
import { DeviceRequestData } from 'src/@types/device.types';
import { BaseService } from 'src/base/base.service';
import { objectTrim } from 'src/utils/utilFunc.util';
import { Repository } from 'typeorm';
import { DeviceEntity } from './deviceInfo.entity';

@Injectable()
export class DeviceInfoService extends BaseService<DeviceEntity> {
  constructor(
    @InjectRepository(DeviceEntity)
    private deviceRepo: Repository<DeviceEntity>,
  ) {
    super(deviceRepo, DeviceEntity);
  }

  async getAllDeviceInfo(): Promise<any> {
    try {
      return await this.deviceRepo.findAndCount({});
    } catch (err) {
      throw new NotFoundException('Something went wrong!');
    }
  }

  async storeDevice(requestData: DeviceRequestData): Promise<any> {
    requestData = await objectTrim(requestData);
    try {
      const deviceFind = await this.findSingle({
        where: {
          brand: requestData.brand,
          deviceId: requestData.deviceId,
          deviceType: requestData.deviceType,
          baseOs: requestData.baseOs,
          deviceName: requestData.deviceName,
          manufacturer: requestData.manufacturer,
          model: requestData.model,
          systemName: requestData.systemName,
          uniqueId: requestData.uniqueId,
          userAgent: requestData.userAgent,
        },
      });

      if (deviceFind) {
        return deviceFind;
      }
      return await this.store(requestData);
    } catch (err) {
      return err;
    }
  }

  async findDevice(id: string) {
    if (!id)
      return new NotFoundResponse({
        message: 'Device ID is required!',
      });
    try {
      const payload = await this.deviceRepo.findOne({
        where: { id: id },
        select: ['id', 'deviceName', 'deviceType'],
      });
      if (!payload)
        return new NotFoundResponse({
          message: 'No device found!',
        });
      return payload;
    } catch (err) {
      throw new NotFoundException('Device Not Found');
    }
  }
}
