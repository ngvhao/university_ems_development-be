/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpStatus } from '@nestjs/common';
import { getRequestId } from './serverless-get-request';
import { Response as ExpressResponse } from 'express';
import { MetaDataInterface } from './interfaces/meta-data.interface';

enum Status {
  OK = 1,
  ERROR = 0,
}

export enum MessageCode {
  OK = '20000',
  CREATED = '20001',
  FAILED = '20002',
  BAD_REQUEST = '40000',
  NOT_FOUND = '40004',
  FORBIDDEN = '40003',
  CONFLICT = '40009',
  INTERNAL_SERVER_ERROR = '50000',
  UNAUTHORIZED = '401',
  MOVED_PERMANENTLY = 'MOVED_PERMANENTLY',
}

interface ResponseOptions {
  status?: number;
  msgcode?: string;
  message?: string;
  statusCode?: HttpStatus;
}

class ResponseFactory {
  public status: number;
  public msgcode: string;
  public statusCode: HttpStatus;
  public message?: string;

  constructor({
    status = Status.OK,
    statusCode = HttpStatus.OK,
    msgcode = MessageCode.OK,
    message,
  }: ResponseOptions) {
    this.status = status;
    this.statusCode = statusCode;
    this.msgcode = msgcode;
    this.message = message;
  }

  public send(res: ExpressResponse): any {
    return res.status(this.statusCode).json({
      ...this,
      requestId: getRequestId(),
    });
  }

  public redirect(res: ExpressResponse, redirect: string) {
    return res.status(HttpStatus.MOVED_PERMANENTLY).redirect(redirect);
  }
}

interface SuccessResponseOptions<T> {
  status?: number;
  msgcode?: string;
  message?: string;
  statusCode?: HttpStatus;
  data?: T;
  metadata?: MetaDataInterface;
}

interface FailedResponseOptions {
  status?: number;
  msgcode?: string;
  message?: string;
  statusCode?: HttpStatus;
  errors?: Record<string, any>;
  metadata?: MetaDataInterface;
}

class SuccessResponse<T> extends ResponseFactory {
  public data: T | null;
  public metadata?: MetaDataInterface | any;

  constructor({
    status = Status.OK,
    statusCode = HttpStatus.OK,
    msgcode = MessageCode.OK,
    message,
    data = null,
    metadata,
  }: SuccessResponseOptions<T>) {
    super({ message, msgcode, status, statusCode });
    this.data = data;
    this.metadata = metadata;
  }
}

class FailedResponse extends ResponseFactory {
  public errors: any;
  public metadata?: MetaDataInterface | any;

  constructor({
    status = Status.OK,
    statusCode = HttpStatus.OK,
    msgcode = MessageCode.OK,
    message,
    errors,
    metadata,
  }: FailedResponseOptions) {
    super({ message, msgcode, status, statusCode });
    this.errors = errors;
    this.metadata = metadata;
  }
}

export { SuccessResponse, FailedResponse };
