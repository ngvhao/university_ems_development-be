import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class MomoIpnDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  partnerCode: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  requestId: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  orderInfo: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  orderType: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transId: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  resultCode: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  payType?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  responseTime?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  extraData?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  signature: string;
}
