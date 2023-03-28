import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";
import { DeviceRequestData } from "src/@types/device.types";
import { AuthGuard } from "src/auth/auth.guard";
import { DeviceDTO } from "./device.dto";
import { DeviceInfoService } from "./deviceInfo.service";

@ApiTags("DeviceInfo")
@Controller("devices")
export class DeviceInfoController {
  constructor(private readonly service: DeviceInfoService) {
    // super(service, []);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async findAll(): Promise<any> {
    return await this.service.getAll();
  }

  @Post()
  @ApiBody({ type: DeviceDTO })
  @UsePipes(ValidationPipe)
  async create(@Body() data: DeviceDTO): Promise<any> {
    return await this.service.storeDevice(data);
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  async findOne(@Param("id") deviceNumber: string): Promise<any> {
    if (!deviceNumber) throw new Error("Device Number is required");
    return this.service.findDevice(deviceNumber);
  }
}
