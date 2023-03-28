import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SuccessResponse } from "src/@responses/success.response";
import { BaseService } from "src/base/base.service";
import { ENV } from "src/ENV";
import { BcryptHelper } from "src/helper/bcrypt.helper";
import { FireBaseHttp } from "src/http/firebaseHttp.service";
import {
  ForgotPasswordDTO,
  PasswordUpdateDTO,
} from "src/modules/auth/dtos/Auth.dto";
import { UserJob } from "src/modules/queues/jobs/user.job";
import { get6digitNumber } from "src/utils/utilFunc.util";
import { Repository } from "typeorm";
import { UserService } from "../../users/services/user.service";
import { OtpEntity } from "../entities/otp.entity";

@Injectable()
export class OtpService extends BaseService<OtpEntity> {
  bcryptHelper = new BcryptHelper();

  constructor(
    @InjectRepository(OtpEntity)
    private otpRep: Repository<OtpEntity>,
    private userService: UserService,
    private userJob: UserJob,
    private firebaseHttp: FireBaseHttp
  ) {
    super(otpRep, OtpEntity);
  }

  async requestForOtp(data: ForgotPasswordDTO): Promise<any> {
    const findUser = await this.userService.findSingle({
      where: { email: data.email, isActive: true },
      select: ["id", "firstName", "lastName", "email", "emailVerified"],
    });
    if (!findUser)
      throw new NotFoundException("Given email address is not valid!");

    if (!findUser.emailVerified)
      throw new BadRequestException("Customer is not verified!");

    const findOtp = await this.findSingle({
      where: { userId: await findUser.id, isVerified: false },
      select: ["id", "userId", "expireAt"],
      order: { createdAt: "DESC" },
    });

    const nowDate = new Date();

    if (findOtp && findOtp.expireAt > nowDate)
      throw new BadRequestException(
        "Your Last verification link is not expired!"
      );

    try {
      nowDate.setMinutes(nowDate.getMinutes() + 5);
      const otp = get6digitNumber();
      if (!otp) throw new BadRequestException("Link generate failed!");

      const token = await this.bcryptHelper.hashString(
        `${data.email}${otp}${nowDate}`
      );
      if (!token) throw new BadRequestException("Token generate failed!");
      const storeData = await this.store({
        userId: findUser.id,
        code: otp,
        expireAt: nowDate,
        type: "password-reset",
        token: token,
      });
      findUser.token = token;

      if (!storeData) throw new BadRequestException("Something went wrong");
      this.userJob.add("passwordResetRequestMail", findUser);

      return new SuccessResponse({
        message: "Successful send link, please find your email!",
        payload: {
          expireAt: nowDate,
        },
      });
    } catch (err) {
      return err;
    }
  }
  async passwordVerification(token): Promise<any> {
    if (!token) throw new UnauthorizedException("Unauthorized request!");
    const findOtp = await this.findSingle({
      where: { token: token, isVerified: false },
      select: ["id", "userId", "expireAt", "code"],
      relations: ["user"],
    });
    if (!findOtp) {
      return await this.redirectDeeplink(
        "password-verify",
        "Unauthorized request!"
      );
      throw new UnauthorizedException("Unauthorized request!");
    }

    if (!findOtp.user.id) {
      return await this.redirectDeeplink(
        "password-verify",
        "User not found try to sigunp!"
      );
    }
    // throw new BadRequestException('Customer is not valid!');

    if (new Date(findOtp.expireAt) < new Date()) {
      return await this.redirectDeeplink(
        "password-verify",
        "Verification link is expired!, Please try again"
      );
    }
    // throw new BadRequestException(
    //   'Verification link is expired!, Please try again',
    // );
    try {
      const passwordResetToken = await this.bcryptHelper.hashString(
        findOtp.userId
      );

      const otpVerify = await this.update(findOtp.id, {
        isVerified: true,
      });

      if (!otpVerify)
        throw new BadRequestException(
          "Something went wrong, please try again!"
        );

      const tokenStore = await this.userService.update(findOtp.userId, {
        token: passwordResetToken,
      });

      if (!tokenStore)
        throw new BadRequestException(
          "Something went wrong, please try again!"
        );

      try {
        const fireBase = await this.firebaseHttp.post("shortLinks", {
          dynamicLinkInfo: {
            domainUriPrefix: "https://kuiperz.page.link",
            link:
              "https://api.kuiperzß.dev/api/v1/auth/public/deep-link?type=forgot-password&token=" +
              passwordResetToken,
            androidInfo: {
              androidPackageName: ENV.ANDROID_PACKAGE_NAME,
            },
            iosInfo: {
              iosBundleId: ENV.IOS_BUNDLE_ID,
            },
          },
        });
        if (await fireBase?.shortLink) return { url: fireBase?.shortLink };
        throw new BadRequestException("Something went wrong");
      } catch (err) {
        throw new BadRequestException(err);
      }
    } catch (err) {
      return err;
    }
  }

  async passwordReset(
    request: PasswordUpdateDTO,
    headers: Headers
  ): Promise<any> {
    const passwordResetToken = headers["passwordtoken"];
    if (!passwordResetToken)
      throw new UnauthorizedException("Unauthorized request!");

    if (request.password !== request.confirmPassword)
      throw new BadRequestException(
        "Password and Confirm Password did't not match!"
      );

    try {
      const findUser = await this.userService.findSingle({
        where: { token: passwordResetToken },
        select: ["id", "firstName", "lastName", "email", "password", "token"],
      });

      if (!findUser) throw new UnauthorizedException("Unauthorized request!");

      const matchedPassword = await this.bcryptHelper.compareHash(
        request.password,
        findUser.password
      );
      if (matchedPassword)
        throw new BadRequestException(
          "Your password as like old password!, please try to different"
        );
      const password = await this.bcryptHelper.hashString(request.password);
      const updatePassword = await this.userService.update(findUser.id, {
        password: password,
        token: null,
      });
      if (!updatePassword)
        throw new BadRequestException(
          "Something went wrong, Please try again!"
        );

      this.userJob.add("passwordResetConfirmationMessage", findUser);

      return new SuccessResponse({
        message: "Password reset successfully, Please try to login.",
        payload: {},
      });
    } catch (err) {
      return err;
    }
  }

  async redirectDeeplink(type: string, msg?: string): Promise<any> {
    const fireBase = await this.firebaseHttp.post("shortLinks", {
      dynamicLinkInfo: {
        domainUriPrefix: "https://kuiperz.page.link",
        link:
          "https://api.kuiperzß.dev/api/v1/auth/public/deep-link?type=" +
          type +
          "&msg=" +
          msg,
        androidInfo: {
          androidPackageName: ENV.ANDROID_PACKAGE_NAME,
        },
        iosInfo: {
          iosBundleId: ENV.IOS_BUNDLE_ID,
        },
      },
    });
    if (await fireBase?.shortLink) return { url: fireBase?.shortLink };
    throw new BadRequestException("Something went wrong");
  }
}
