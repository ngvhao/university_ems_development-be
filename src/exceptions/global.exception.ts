import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { getRequestId } from 'src/utils/serverless-get-request';
import { QueryFailedError } from 'typeorm';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = getRequestId();
    const timestamp = new Date().toISOString();
    const path = request.url;
    let errors = exception.errors;
    console.error('GlobalExceptionsFilter@catch:', exception);
    let statusCode =
      exception.getResponse()['statusCode'] || HttpStatus.INTERNAL_SERVER_ERROR;
    let message = exception.getResponse()['errors'] || 'Internal Server Error';

    if (exception instanceof QueryFailedError) {
      statusCode = HttpStatus.BAD_REQUEST;
      message = 'Query fail';
    }

    if (exception instanceof BadRequestException) {
      message = exception.message;
      statusCode = exception.getStatus();
      errors = exception.getResponse()['errors'];
    }

    this.logger.error({
      timestamp,
      path,
      requestId,
      statusCode,
      message: exception.message,
      stack: exception.stack,
    });
    const responseBody = {
      statusCode: exception.status || statusCode,
      message: exception.message || message,
      errors,
      requestId,
    };

    response.status(statusCode).json(responseBody);
  }
}
