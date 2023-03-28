/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class DeviceDTO {
  @ApiProperty({ example: 'brand' })
  @IsNotEmpty({ message: 'Brand is required!' })
  brand: string;

  @ApiProperty({ example: 'Device Id' })
  @IsNotEmpty({ message: 'Device Id is required!' })
  deviceId: string;

  @ApiProperty({ example: 'Device Type' })
  @IsNotEmpty({ message: 'Device type is required!' })
  deviceType: string;

  @ApiProperty({ example: 'Device Id' })
  @IsNotEmpty({ message: 'Base OS is required!' })
  baseOs: string;

  @ApiProperty({ example: 'Device Name' })
  @IsNotEmpty({ message: 'Device name is required!' })
  deviceName: string;

  @ApiProperty({ example: 'manufacturer' })
  @IsNotEmpty({ message: 'Manufacturer is required!' })
  manufacturer: string;

  @ApiProperty({ example: 'model' })
  @IsNotEmpty({ message: 'Model is required!' })
  model: string;

  @ApiProperty({ example: 'System Name' })
  @IsNotEmpty({ message: 'System name is required!' })
  systemName: string;

  @ApiProperty({ example: 'Unique ID' })
  @IsNotEmpty({ message: 'Unique ID is required!' })
  uniqueId: string;

  @ApiProperty({ example: 'userAgent' })
  @IsNotEmpty({ message: 'User agent is required!' })
  userAgent: string;
}
