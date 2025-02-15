import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor() {}

  async validateUser(_email: string, _password: string): Promise<any> {
    return null;
  }
}
