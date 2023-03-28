import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { RedisService } from "src/@common/services/redis.service";
import { NotFoundResponse } from "src/@responses/notfound.response";
import { SuccessResponse } from "src/@responses/success.response";
import { TokenGeneratorPayload } from "src/@types/token.types";
import { RoleMetaKye } from "src/enums/roles.enum";
import { ENV } from "src/ENV";
import { BcryptHelper } from "src/helper/bcrypt.helper";
import { JWTHelper } from "src/helper/jwt.helper";
import { FireBaseHttp } from "src/http/firebaseHttp.service";
import { DeviceInfoService } from "src/modules/deviceInfo/deviceInfo.service";
import { UserJob } from "src/modules/queues/jobs/user.job";
import { RoleService } from "src/modules/users/services/role.service";
import { UserService } from "src/modules/users/services/user.service";
import {
  awsServerFileRemover,
  awsServerFileUploader,
  IServerFileUploaderReturn,
} from "src/utils/fileManagment";
import { objectTrim } from "src/utils/utilFunc.util";
import { LoginDTO, ProfileUpdateDTO, SignUpDTO } from "../dtos/Auth.dto";

@Injectable()
export class AuthService {
  jwtHelper = new JWTHelper();
  bcryptHelper = new BcryptHelper();
  constructor(
    private readonly userService: UserService,
    private readonly redis: RedisService,
    private deviceService: DeviceInfoService,
    private userJob: UserJob,
    private roleService: RoleService,
    private firebaseHttp: FireBaseHttp
  ) {}

  async login(deviceId: string, payload: LoginDTO): Promise<any> {
    const findDevice: any = await this.deviceService.findDevice(deviceId);

    if (!findDevice) throw new UnauthorizedException("Unauthorized device!");

    const user: any = await this.userService.findSingle({
      where: { email: payload.email },
      select: [
        "id",
        "firstName",
        "lastName",
        "email",
        "phone",
        "address",
        "image",
        "emailVerified",
        "isActive",
        "password",
      ],
    });

    if (!user)
      return new NotFoundResponse({
        message: "No user data found",
        payload: {},
      });
    // user email verification
    if (!user?.emailVerified)
      throw new BadRequestException("User is not verified!");

    if (!user.isActive)
      throw new BadRequestException("User has been deactivated!");

    const isValidPassword = await this.bcryptHelper.compareHash(
      payload.password,
      user.password
    );

    if (!isValidPassword) throw new BadRequestException("Credential not match");
    //remove old token
    await this.redis.remove(user.id + "-" + deviceId);
    await this.redis.remove(user.email + "-" + deviceId);

    try {
      const tokenPayload: TokenGeneratorPayload = {
        isAccessToken: true,
        id: user.id,
        email: user.email,
        deviceId: findDevice.id,
      };

      const token: any = await this.jwtHelper.generateAccessToken(tokenPayload);
      tokenPayload.isAccessToken = false;

      const refreshToken = await this.jwtHelper.generateRefreshToken(
        tokenPayload
      );
      delete user?.password;
      const access = await this.redis.set(
        tokenPayload.id + "-" + deviceId,
        user,
        1036800
      );

      const refresh = await this.redis.set(
        tokenPayload.email + "-" + deviceId,
        user,
        31536000
      );
      delete user.password;
      delete user.emailVerified;
      delete user.isActive;
      return {
        accessToken: token?.token,
        refreshToken: refreshToken?.token,
        user: user,
      };
    } catch (err) {
      return err;
    }
  }

  async signUp(requestData: SignUpDTO): Promise<any> {
    const trimData: any = await objectTrim(requestData);

    const findUser = await this.userService.findSingle({
      where: { email: trimData.email },
      select: ["id", "email"],
    });
    if (findUser) throw new BadRequestException("User already exist");

    if (trimData.password !== trimData.confirmPassword)
      throw new BadRequestException(
        "Password and confirm password is not same"
      );
    const token = await this.bcryptHelper.hashString(
      `${trimData.email}${Date.now()}`
    );

    const storeData: any = {
      email: trimData.email,
      password: await this.bcryptHelper.hashString(trimData.password),
      token: token,
      emailVerified: false,
      image: null,
      isActive: false,
    };

    if (trimData.firstName) storeData.firstName = trimData.firstName;
    if (trimData.lastName) storeData.lastName = trimData.lastName;

    const findRole = await this.roleService.findSingle({
      where: { metaKey: RoleMetaKye.USER, isActive: true },
      select: ["id"],
    });
    if (!findRole)
      throw new BadRequestException("Something went wrong!, Role Issue");

    const storeSigUp = await this.userService.signUp(storeData, findRole);

    if (storeSigUp.id) {
      await this.userJob.add("accountVerification", {
        ...storeData,
        token: token,
      });

      return new SuccessResponse({
        message:
          "Please check your inbox and Verify your email to begin using the app.",
        payload: {},
      });
    }

    throw new BadRequestException("Signup is not completed!.");
    // return trimData;
  }

  async verifyUser(hash: string): Promise<any> {
    const user = await this.userService.findSingle({
      where: { token: hash },
      select: [
        "id",
        "firstName",
        "lastName",
        "email",
        "token",
        "emailVerified",
        "isActive",
      ],
    });

    if (!user) throw new BadRequestException("Invalid verification URL!");

    if (user?.emailVerified) {
      return await this.redirectDeeplink(
        "email-verify",
        "User already verified!"
      );
      // throw new BadRequestException('Customer already verified!');
    }

    if (user.token === hash) {
      const verificationCompleted = await this.userService.update(user.id, {
        emailVerified: true,
        isActive: true,
      });

      if (!verificationCompleted) {
        return await this.redirectDeeplink(
          "email-verify",
          "User verification failed!"
        );
      }
    }

    this.userJob.add("accountVerificationComplete", user);
    try {
      const fireBase = await this.firebaseHttp.post("shortLinks", {
        dynamicLinkInfo: {
          domainUriPrefix: "https://kuiperz.page.link",
          link:
            "https://api.kuiperz.dev/v1/auth/public/deep-link?type=sign-up&token=" +
            hash,
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
      return err;
    }
  }

  async myProfile(authInfo: any): Promise<any> {
    const findUser = await this.userService.findSingle({
      where: { id: authInfo.id },
      select: [
        "id",
        "firstName",
        "lastName",
        "image",
        "email",
        "phone",
        "address",
      ],
    });

    if (!findUser)
      return new NotFoundResponse({
        message: "No user found!",
      });

    return new SuccessResponse({
      message: "Profile info",
      payload: findUser,
    });
  }
  // TODO:: Need to work
  async updateProfile(
    authInfo: any,
    requestData: ProfileUpdateDTO
  ): Promise<any> {
    // return authInfo;
    const findUser = await this.userService.findSingle({
      where: { id: authInfo.id },
      select: ["id", "firstName", "lastName", "image", "phone", "address"],
    });
    // return findUser;
    if (!findUser) return new NotFoundResponse();

    let profileImage = null;
    if (requestData?.image) {
      const uploadedFile: IServerFileUploaderReturn =
        await awsServerFileUploader(requestData?.image, "profile");
      if (uploadedFile.success) profileImage = uploadedFile.storedFiles[0];
      if (findUser.image && profileImage) awsServerFileRemover(findUser.image);
    }

    const update = await this.userService.update(findUser.id, {
      firstName: requestData.firstName || findUser.firstName,
      lastName: requestData.lastName || findUser.lastName,
      phone: requestData.phone || findUser.phone,
      address: requestData.address || findUser.address,
      image: profileImage || findUser.image,
    });

    if (!update) throw new BadRequestException("Profile is not updated!");

    // if (findUser.image && requestData?.image?.filename)
    //   await localFileDelete(findUser.image);

    return new SuccessResponse({
      message: "Profile update successfully!",
      payload: {},
    });
  }

  async logout(authUser: any, deviceId: string): Promise<any> {
    await this.redis.remove(authUser.id + "-" + deviceId);
    await this.redis.remove(authUser.email + "-" + deviceId);
    return { message: "Logout success!" };
  }

  async refreshLogin(authUser: any, deviceId: string): Promise<any> {
    const findDevice = await this.deviceService.findDevice(deviceId);
    if (!findDevice) throw new UnauthorizedException("Unauthorized device!");

    const user: any = await this.userService.findSingle({
      where: { email: authUser.email },
      select: [
        "id",
        "firstName",
        "lastName",
        "email",
        "emailVerified",
        "isActive",
        "password",
      ],
    });

    if (!user)
      return new NotFoundResponse({
        message: "User not found!",
      });
    // user email verification
    if (!user?.emailVerified)
      throw new BadRequestException("User is not verified!");

    if (!user.isActive)
      throw new BadRequestException("User has been deactivated!");

    //remove old token
    await this.redis.remove(user.id + "-" + deviceId);
    await this.redis.remove(user.email + "-" + deviceId);

    try {
      const tokenPayload: TokenGeneratorPayload = {
        isAccessToken: true,
        id: user.id,
        email: user.email,
        deviceId: deviceId,
      };

      const token: any = await this.jwtHelper.generateAccessToken(tokenPayload);
      tokenPayload.isAccessToken = false;

      const refreshToken = await this.jwtHelper.generateRefreshToken(
        tokenPayload
      );
      delete user?.password;
      const access = await this.redis.set(
        tokenPayload.id + "-" + deviceId,
        user,
        1036800
      );

      const refresh = await this.redis.set(
        tokenPayload.email + "-" + deviceId,
        user,
        31536000
      );
      delete user.password;
      delete user.emailVerified;
      delete user.isActive;
      return {
        accessToken: token?.token,
        refreshToken: refreshToken?.token,
        user: user,
      };
    } catch (err) {
      return err;
    }
  }
  async redirectDeeplink(type: string, msg?: string): Promise<any> {
    const fireBase = await this.firebaseHttp.post("shortLinks", {
      dynamicLinkInfo: {
        domainUriPrefix: "https://kuiperz.page.link",
        link:
          "https://api.kuiperz.dev/api/v1/auth/public/deep-link?type=" +
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
