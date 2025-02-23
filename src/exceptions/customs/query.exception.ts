import { HttpException, HttpStatus } from '@nestjs/common';

export class QueryFailException extends HttpException {
  constructor() {
    super('Database query error', HttpStatus.BAD_REQUEST);
  }
}
