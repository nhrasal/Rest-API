export type Token = {
  token: string;
  exp: string;
};

export type TokenGeneratorPayload = {
  id: string;
  deviceId: string;
  email: string;
  isAccessToken?: boolean;
  user?: any;
};

export type TokenPayloadReturn = {
  id: string;
  email: string;
  isAccessToken?: boolean;
  deviceId: string;
  user?: any;
  iat: string;
  exp: string;
};
