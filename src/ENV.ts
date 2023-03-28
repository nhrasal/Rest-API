import { config } from "dotenv";
import * as path from "path";
export function toBool(value: string): boolean {
  return value === "true";
}
config({
  path: path.join(
    process.cwd(),
    `env/${process.env.NODE_ENV || "development"}.env`
  ),
  // path: path.join(process.cwd(), `development.env`),
});

export const ENV_DEVELOPMENT = "development";
export const ENV = {
  APP_ENV: process.env.APP_ENV,
  port: process.env.PORT,
  env: process.env.NODE_ENV || ENV_DEVELOPMENT,
  isDevelopment: process.env.NODE_ENV === ENV_DEVELOPMENT,

  logFilePath: process.env.LOG_FILE_PATH,
  OTP_Timeout: process.env.OTP_Timeout,

  API_PREFIX: process.env.API_PREFIX,
  API_TITLE: process.env.API_TITLE,
  API_DESC: process.env.API_DESC,
  API_VERSION: process.env.API_VERSION,
  APP_URL: process.env.APP_URL,

  // hash salt
  SALT_ROUNDS: process.env.SALT_ROUNDS,
  BASE_URL: process.env.BASE_URL,

  // throttle configuration
  THROTTLE_TTL: +process.env.THROTTLE_TTL || 60,
  THROTTLE_LIMIT: +process.env.THROTTLE_LIMIT || 100,
  MAIL_HOST: process.env.MAIL_HOST,
  MAIL_PORT: parseInt(process.env.MAIL_PORT),
  MAIL_USER: process.env.MAIL_USER,
  MAIL_PASSWORD: process.env.MAIL_PASSWORD,
  MAIL_FROM_ADDRESS: process.env.MAIL_FROM_ADDRESS,
  MAIL_FROM_NAME: process.env.MAIL_FROM_NAME,

  // jwt token configuration
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_ACCESS_TOKEN_ALGORITHM: process.env.JWT_ACCESS_TOKEN_ALGORITHM,
  JWT_ACCESS_TOKEN_EXPIRE_TIME: process.env.JWT_ACCESS_TOKEN_EXPIRE_TIME,
  JWT_REFRESH_TOKEN_ALGORITHM: process.env.JWT_REFRESH_TOKEN_ALGORITHM,
  JWT_REFRESH_TOKEN_EXPIRE_TIME: process.env.JWT_REFRESH_TOKEN_EXPIRE_TIME,
  REFRESH_JWT_SECRET: process.env.REFRESH_JWT_SECRET,

  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION,
  AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,
  AWS_PREFIX_URL: process.env.AWS_PREFIX_URL,
  AWS_PREFIX_URL_REMOVE: process.env.AWS_PREFIX_URL_REMOVE,

  WEB_HOOK_ADDRESS: process.env.WEB_HOOK_ADDRESS,

  // Stripe configuration
  STRIPE_API_KEY: process.env.STRIPE_API_KEY,
  STRIPE_API_VERSION: process.env.STRIPE_API_VERSION,

  //DISCORD WEBHOOK
  DISCORD_WEB_HOOK_URL: process.env.DISCORD_WEB_HOOK_URL,

  //Image
  IMAGE_LOCAL_PATH: process.env.IMAGE_LOCAL_PATH,
  IMAGE_MAX_SIZE: +process.env.IMAGE_MAX_SIZE,

  // FIREBASE APP API
  FIREBASE_APP_API_URL: process.env.FIREBASE_APP_API_URL,
  FIREBASE_APP_API_KEY:
    process.env.FIREBASE_APP_API_KEY ||
    "AIzaSyBhdM88WLxOOziY1BYs8ZjTVMzsCYgFF3E",

  //  QUEUE ATTEMPTS
  QUEUE_ATTEMPTS: process.env.QUEUE_ATTEMPTS || 5,
  QUEUE_DELAY: process.env.QUEUE_DELAY || 5000,
  QUEUE_BACKOFF: process.env.QUEUE_BACKOFF || 5000,
  QUEUE_TIMEOUT: process.env.QUEUE_TIMEOUT || 300000,
  DEFAULT_IMAGE: process.env.DEFAULT_IMAGE,

  ANDROID_PACKAGE_NAME: process.env.ANDROID_PACKAGE_NAME,
  IOS_BUNDLE_ID: process.env.IOS_BUNDLE_ID,

  Redis: {
    tls: toBool(process.env.BULL_REDIS_TLS) ? {} : null,
    host: process.env.BULL_REDIS_HOST,
    port: +process.env.BULL_REDIS_PORT,
    username: process.env.BULL_REDIS_USERNAME,
    password: process.env.BULL_REDIS_PASSWORD,
  },

  DB: {
    type: "postgres",
    host: process.env.TYPEORM_HOST,
    port: +process.env.TYPEORM_PORT,
    username: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    database: process.env.TYPEORM_DATABASE,

    synchronize: process.env.TYPEORM_SYNCHRONIZE,
    logging: process.env.TYPEORM_LOGGING,
  },
};

export const ormConfig: any = {
  type: ENV.DB.type,
  host: ENV.DB.host,
  port: +ENV.DB.port,
  username: ENV.DB.username,
  password: ENV.DB.password,
  database: ENV.DB.database,

  synchronize: toBool(ENV.DB.synchronize),
  logging: toBool(ENV.DB.logging),
};
