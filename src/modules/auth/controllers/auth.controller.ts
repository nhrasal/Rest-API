import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Put,
  Query,
  Res,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { SuccessResponse } from 'src/@responses/success.response';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthUser } from 'src/decorators/authUser.decorator';
import { DeviceId } from 'src/decorators/deviceId.decorator';
import { ENV } from 'src/ENV';
import { OtpService } from 'src/modules/users/services/otp.service';
import { objectTrim, storageOptions } from 'src/utils/utilFunc.util';
import {
  ForgotPasswordDTO,
  LoginDTO,
  PasswordUpdateDTO,
  ProfileUpdateDTO,
  SignUpDTO,
} from '../dtos/Auth.dto';
import { AuthService } from '../services/auth.service';

@ApiHeader({ name: 'deviceId', required: true, description: 'Device Id' })
@ApiTags('AuthInfo')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly service: AuthService,
    private readonly otpService: OtpService,
  ) {}
  @Post('signup')
  @ApiBody({ type: SignUpDTO })
  @UsePipes(ValidationPipe)
  async signUp(@Body() data: SignUpDTO): Promise<any> {
    return await this.service.signUp(data);
  }

  @Get('public/email-verify')
  @ApiQuery({ name: 'token', required: true })
  async verifyUser(
    @Query() query: { token: string },
    @Res() res: any,
  ): Promise<any> {
    if (!query.token)
      throw new UnauthorizedException('This request is not authorized');

    const payload = await this.service.verifyUser(query.token);
    if (payload.url) return await res.redirect(payload.url, 301);
    return payload;
  }

  @Post('login')
  @ApiBody({ type: LoginDTO })
  @UsePipes(ValidationPipe)
  async login(
    @DeviceId() deviceId: string,
    @Body() data: LoginDTO,
  ): Promise<any> {
    return await this.service.login(deviceId, data);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  async profile(@AuthUser() user: any): Promise<any> {
    return await this.service.myProfile(user);
  }

  @Put('profile-update')
  @UseGuards(AuthGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ProfileUpdateDTO })
  @UsePipes(ValidationPipe)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: storageOptions,
      limits: { fileSize: ENV.IMAGE_MAX_SIZE },
      fileFilter: (req, file, cb) => {
        if (
          !file.mimetype.includes('image/png') &&
          !file.mimetype.includes('image/jpeg') &&
          !file.mimetype.includes('image/jpg')
        ) {
          req.fileValidationError = 'Given file is not valid image!';
          return cb(
            new BadRequestException('Given file is not valid image!'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  @UseGuards(AuthGuard)
  async updateProfile(
    @AuthUser() user: any,
    @UploadedFile() image,
    @Body() requestData: ProfileUpdateDTO,
  ): Promise<any> {
    requestData = await objectTrim(requestData);
    if (image) requestData.image = image;
    // return requestData;
    return await this.service.updateProfile(user, requestData);
  }

  @Get('check')
  @UseGuards(AuthGuard)
  async authCheck(@AuthUser() user: any): Promise<any> {
    return user;
  }

  @Get('logout')
  @UseGuards(AuthGuard)
  async logout(
    @AuthUser() user: any,
    @DeviceId() deviceId: string,
  ): Promise<any> {
    return await this.service.logout(user, deviceId);
  }

  @Get('refresh-login')
  @UseGuards(AuthGuard)
  async refreshLogin(
    @AuthUser() user: any,
    @DeviceId() deviceId: string,
  ): Promise<any> {
    return await this.service.refreshLogin(user, deviceId);
  }

  @Post('forgot-password')
  @ApiBody({ type: ForgotPasswordDTO })
  @UsePipes(ValidationPipe)
  async forgotPassword(@Body() data: ForgotPasswordDTO): Promise<any> {
    return await this.otpService.requestForOtp(data);
  }

  @Get('public/password-verification')
  @ApiQuery({ name: 'token', required: true })
  async passwordVerification(
    @Query() query: { token: string },
    @Res() res,
  ): Promise<any> {
    const payload = await this.otpService.passwordVerification(query.token);

    if (payload.url) return await res.redirect(payload.url, 301);

    return payload;
  }
  @Put('reset-password')
  @ApiBody({ type: PasswordUpdateDTO })
  @ApiHeader({
    name: 'passwordToken',
    required: true,
    description: 'Reset password token',
  })
  @UsePipes(ValidationPipe)
  async passwordUpdate(
    @Body() data: PasswordUpdateDTO,
    @Headers() headers: any,
  ): Promise<any> {
    return await this.otpService.passwordReset(data, headers);
  }

  @Get('public/deep-link')
  @ApiQuery({ name: 'token', required: true })
  async deepLink(@Query() query: { token: string }) {
    return await new SuccessResponse({
      message: 'Successfully processed',
      payload: {},
    });
  }
}
