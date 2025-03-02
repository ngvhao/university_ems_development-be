import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { getRequestId } from 'src/utils/serverless-get-request';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError, HttpException)
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
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';
    let errors = null;
    console.error('GlobalExceptionsFilter@catch:', exception);

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      message = exception.getResponse()['message'] || exception.message;
      errors = exception.getResponse()['errors'];
    }

    if (exception instanceof QueryFailedError) {
      statusCode = HttpStatus.BAD_REQUEST;
      message = 'Database query failed';
    }

    this.logger.error({
      timestamp,
      path,
      requestId,
      statusCode,
      message: exception.message,
      // stack: exception.stack,
    });
    const responseBody = {
      statusCode: exception.status || statusCode,
      message: message,
      errors,
      requestId,
    };

    response.status(statusCode).json(responseBody);
  }
}
