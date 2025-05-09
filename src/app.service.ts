import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) {}

  async getHello(): Promise<string> {
    const url = 'https://catfact.ninja/fact';
    const response = await lastValueFrom(this.httpService.get(url));
    console.log('getHello@@@response::', response.data);
    return response.data;
  }
}
