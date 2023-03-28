import { decode, sign, verify } from 'jsonwebtoken';
import { Token, TokenGeneratorPayload } from 'src/@types/token.types';
import { ENV } from 'src/ENV';

const JWT_SECRET: string = ENV.JWT_SECRET;
const REFRESH_JWT_SECRET: string = ENV.REFRESH_JWT_SECRET;

export class JWTHelper {
  //to encode
  private async sign(payload: any, options: any, SECRET: string) {
    return sign(payload, SECRET, options);
  }

  // Access token generate
  public async generateAccessToken(
    data: TokenGeneratorPayload,
  ): Promise<Token> {
    const configAccess = {
      payload: {
        ...data,
      },
      options: {
        algorithm: ENV.JWT_ACCESS_TOKEN_ALGORITHM,
        expiresIn: ENV.JWT_ACCESS_TOKEN_EXPIRE_TIME,
      },
    };
    const token = await this.sign(
      configAccess.payload,
      configAccess.options,
      JWT_SECRET,
    );
    const tokenData: any = decode(token);

    const exp = tokenData.exp;
    return { token, exp };
  }
  //Access Token Verification
  public async decodeToken(token: string) {
    return verify(token, JWT_SECRET) ?? verify(token, REFRESH_JWT_SECRET);
  }
  // refresh token generate
  public async generateRefreshToken(
    data: TokenGeneratorPayload,
  ): Promise<Token> {
    const configAccess = {
      payload: {
        ...data,
      },
      options: {
        algorithm: ENV.JWT_REFRESH_TOKEN_ALGORITHM,
        expiresIn: ENV.JWT_REFRESH_TOKEN_EXPIRE_TIME,
      },
    };
    const token = await this.sign(
      configAccess.payload,
      configAccess.options,
      JWT_SECRET,
    );
    const tokenData: any = decode(token);

    const exp = tokenData.exp;
    return { token, exp };
  }
  //Refresh Token Verification
  public async verifyRefreshToken(token: string) {
    return verify(token, REFRESH_JWT_SECRET);
  }
}
