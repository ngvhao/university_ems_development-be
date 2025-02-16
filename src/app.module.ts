import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import dataSource from 'db/data-source';

@Module({
  imports: [TypeOrmModule.forRoot(dataSource.options), AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
