import { NestApplicationOptions, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from "@nestjs/swagger";
import * as basicAuth from "express-basic-auth";
import { utilities, WinstonModule } from "nest-winston";
import * as path from "path";
import { format, transports } from "winston";
import { AppModule } from "./app.module";
import { ENV } from "./ENV";

const PORT = ENV.port;
const API_PREFIX = ENV.API_PREFIX;
const APP_TITLE = ENV.API_TITLE;
const API_DESC = ENV.API_DESC;
const API_VERSION = ENV.API_VERSION;

const fileTransport = !ENV.isDevelopment
  ? [
      new transports.File({
        format: format.combine(
          utilities.format.nestLike(),
          format.json(),
          format.timestamp()
        ),
        filename: ENV.logFilePath,
      }),
    ]
  : [];

const appOptions: NestApplicationOptions = {
  cors: true,
  logger: WinstonModule.createLogger({
    exitOnError: true,

    transports: [
      new transports.Console({
        // silent: true,
        format: format.combine(utilities.format.nestLike()),
      }),
      ...fileTransport,
    ],
  }),
};
async function bootstrap() {
  const app: any = await NestFactory.create(AppModule, appOptions);
  app.setGlobalPrefix(API_PREFIX);
  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: false,
    },
    customSiteTitle: "My API Docs",
  };
  app.useStaticAssets(path.join(__dirname, "../uploads"));
  app.use(
    ["/docs", "/docs-json"],
    basicAuth({
      challenge: true,
      users: {
        kuiperz: "kuiperz@123",
      },
    })
  );

  const options = new DocumentBuilder()
    .setTitle(APP_TITLE)
    .setDescription(API_DESC)
    .setVersion(API_VERSION)
    .setBasePath(API_PREFIX)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup("/docs", app, document, customOptions);
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(PORT);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
