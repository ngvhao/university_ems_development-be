import { MomoConfig } from 'src/utils/constants';
import { IPaymentStrategy } from './IPaymentStrategy.interface';
import axios from 'axios';
import * as crypto from 'crypto';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

@Injectable()
export class MomoPayment implements IPaymentStrategy {
  async processPayment(amount: number, transactionId: number): Promise<string> {
    amount = amount | 0;
    const partnerCode = MomoConfig.partnerCode;
    const accessKey = MomoConfig.accessKey;
    const secretkey = MomoConfig.secretkey;
    const requestId = partnerCode + new Date().getTime() + transactionId;
    const orderId = requestId;
    const orderInfo = 'Thanh toan hoc phi sinh vien';
    const redirectUrl = MomoConfig.redirectUrl;
    const ipnUrl = MomoConfig.ipnUrl;
    const requestType = MomoConfig.requestType;
    const extraData = transactionId;

    const rawSignature =
      'accessKey=' +
      accessKey +
      '&amount=' +
      amount +
      '&extraData=' +
      extraData +
      '&ipnUrl=' +
      ipnUrl +
      '&orderId=' +
      orderId +
      '&orderInfo=' +
      orderInfo +
      '&partnerCode=' +
      partnerCode +
      '&redirectUrl=' +
      redirectUrl +
      '&requestId=' +
      requestId +
      '&requestType=' +
      requestType;

    console.log('--------------------RAW SIGNATURE----------------');
    console.log(rawSignature);

    const signature = crypto
      .createHmac('sha256', secretkey)
      .update(rawSignature)
      .digest('hex');
    console.log('--------------------SIGNATURE----------------');
    console.log('processPayment@@signature::', signature);

    const requestBody = JSON.stringify({
      partnerCode: partnerCode,
      accessKey: accessKey,
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: ipnUrl,
      extraData: extraData,
      requestType: requestType,
      signature: signature,
      lang: MomoConfig.lang,
    });

    const options = {
      hostname: MomoConfig.hostname,
      port: MomoConfig.port,
      path: MomoConfig.path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
      },
    };

    try {
      const momoAxiosRes = await axios({
        method: options.method,
        url: options.hostname + options.path,
        headers: options.headers,
        data: requestBody,
      });

      console.log(`MoMo Status: ${momoAxiosRes.status}`);
      console.log(`MoMo Headers: ${JSON.stringify(momoAxiosRes.headers)}`);
      console.log('MoMo Response Body: ');
      console.log(momoAxiosRes.data);

      const responseJson = momoAxiosRes.data;

      if (momoAxiosRes.status === 200 && responseJson.resultCode === 0) {
        console.log('MoMo request successful.');
        console.log('Pay URL: ', responseJson.payUrl);
        return responseJson.payUrl;
      } else {
        console.error(
          'MoMo request successful (HTTP 200) but returned a business error.',
        );
        console.error('Result Code:', responseJson.resultCode);
        console.error('Message:', responseJson.message);
        throw new BadRequestException(
          `MoMo payment processing error: ${responseJson}`,
        );
      }
    } catch (error) {
      console.error('Problem with MoMo request (Axios):');
      if (error.response) {
        console.error(`MoMo Error Status: ${error.response.status}`);
        console.error(
          `MoMo Error Data: ${JSON.stringify(error.response.data)}`,
        );
        console.error(
          `MoMo Error Headers: ${JSON.stringify(error.response.headers)}`,
        );
        throw new BadRequestException(
          `MoMo payment processing error: ${error.response.data.message}, detail: ${error.message}`,
        );
      } else if (error.request) {
        throw new InternalServerErrorException(
          `No response received from MoMo: ${error.message}`,
        );
      } else {
        console.error('Error setting up MoMo request:', error.message);
        throw new InternalServerErrorException(
          `Error setting up MoMo request: ${error.message}`,
        );
      }
    }
  }

  async refundPayment(transactionId: string): Promise<string> {
    console.log(`Refunding transaction ${transactionId} via Momo...`);
    return Promise.resolve('Momo refund successful');
  }
}
