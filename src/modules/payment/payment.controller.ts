import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { MomoIpnDto } from './dto/momoIPNResponse.dto';

@Controller('payments')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  @Post('/momo/callback')
  @HttpCode(HttpStatus.OK)
  async handleMomoIpn(@Body() momoIpnDto: MomoIpnDto) {
    this.logger.log('Received MoMo IPN:', JSON.stringify(momoIpnDto));

    // === BƯỚC 1: XÁC THỰC CHỮ KÝ (SIGNATURE VERIFICATION) ===
    // Đây là bước CỰC KỲ QUAN TRỌNG để đảm bảo IPN đến từ MoMo và không bị sửa đổi.
    // Logic xác thực chữ ký sẽ phụ thuộc vào thuật toán MoMo sử dụng (thường là HMAC SHA256).
    // Bạn sẽ cần accessKey và secretKey của mình từ MoMo.
    // const isValidSignature = this.paymentService.verifyMomoSignature(momoIpnDto);
    // if (!isValidSignature) {
    //   this.logger.error('Invalid MoMo IPN signature');
    //   // Trả về lỗi hoặc không làm gì cả, tùy theo yêu cầu của MoMo khi signature sai
    //   // MoMo có thể sẽ gửi lại IPN nếu không nhận được phản hồi thành công.
    //   // Quan trọng là không xử lý nghiệp vụ nếu chữ ký không hợp lệ.
    //   return { err: 'Invalid signature' }; // Hoặc response theo yêu cầu MoMo
    // }

    // === BƯỚC 2: XỬ LÝ LOGIC THANH TOÁN ===
    // if (momoIpnDto.resultCode === 0) { // Kiểm tra thanh toán thành công
    //   this.logger.log(`Payment successful for orderId: ${momoIpnDto.orderId}, MoMo transId: ${momoIpnDto.transId}`);
    //   // await this.paymentService.processSuccessfulPayment(momoIpnDto);
    // } else {
    //   this.logger.warn(`Payment failed or pending for orderId: ${momoIpnDto.orderId}. ResultCode: ${momoIpnDto.resultCode}, Message: ${momoIpnDto.message}`);
    //   // await this.paymentService.processFailedPayment(momoIpnDto);
    // }

    // === BƯỚC 3: PHẢN HỒI CHO MOMO ===
    // MoMo thường mong đợi bạn trả về HTTP status 200 OK và có thể là một cấu trúc JSON cụ thể
    // để xác nhận đã nhận và xử lý IPN. Nếu không, MoMo có thể gửi lại IPN nhiều lần.
    // Tham khảo tài liệu MoMo để biết định dạng phản hồi chính xác.
    // Ví dụ một phản hồi đơn giản (cần điều chỉnh theo tài liệu MoMo):
    return {
      partnerCode: momoIpnDto.partnerCode,
      requestId: momoIpnDto.requestId,
      orderId: momoIpnDto.orderId,
      resultCode: 0,
      message: 'Success',
    };
  }
}
