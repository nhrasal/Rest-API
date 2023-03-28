import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { QueryFailedError } from "typeorm";
// import { EntityColumnNotFound } from 'typeorm/error/EntityColumnNotFound';
import { getNewLogger } from "../@logger/logger";
import { BaseLogger } from "../@logger/Base.logger";
import typeormQueryFailedMessageUtil from "../utils/typeormQueryFailedMessage.util";
import { CustomException } from "./Custom.exception";
import { ThrottlerException } from "@nestjs/throttler";

const exceptionList = [
  "UnauthorizedException",
  "BadRequestException",
  "NotFoundException",
];

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger: BaseLogger = getNewLogger("AllExceptionsFilter");

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const request = ctx.getRequest();
    let statusCode: number;
    let errorMessages: string[] = [exception.message];
    let message: string = exception.message;
    let msg: string;
    if (exception instanceof CustomException) {
      msg = exception.message;
    } else if (exception instanceof ThrottlerException) {
      statusCode = exception.getStatus();
      msg = "Unknown request";
    } else if (exception instanceof TypeError) {
      this.logger.error(exception.message, exception.stack, exception.name);
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      if (exception.message) {
        errorMessages = [exception.message];
        message = exception.message;
      } else {
        errorMessages = ["internal server error"];
        message = "internal server error";
      }
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res: any = exception.getResponse();
      errorMessages =
        typeof res.message === "string" ? [res.message] : res.message;
      message = typeof res.message === "string" ? res.message : "";
    } else if (exception instanceof QueryFailedError) {
      statusCode = HttpStatus.BAD_REQUEST;
      errorMessages = typeormQueryFailedMessageUtil(exception);
    }
    // else if (exception instanceof EntityColumnNotFound) {
    //   statusCode = HttpStatus.BAD_REQUEST;
    // }
    else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      errorMessages = errorMessages.length
        ? errorMessages
        : ["internal server error"];
    }

    this.logger.error(exception.message, exception);

    const res = {
      success: false,
      statusCode: statusCode,
      message: message || msg || "something went wrong",
      errorMessages,
      // timestamp: new Date().toISOString(),
      // path: request.url,
      devMessage: "something went wrong",
    };
    // TODO::redirect to url need to handle properly
    if (
      (request.originalUrl.search("password-verification") > 0 ||
        request.originalUrl.search("verify") > 0) &&
      statusCode === 503
    ) {
      response.status(301);
      return;
    }

    response.status(statusCode).json(res);
  }
}
