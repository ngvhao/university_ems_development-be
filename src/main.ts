import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from './pipes/validation.pipe';
import { HttpExceptionFilter } from './exceptions/global.exception';
import * as dotenv from 'dotenv';
import { INestApplication } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import * as bodyParser from 'body-parser';

export function setupMiddlewares(app: INestApplication) {
  const expressApp = app as NestExpressApplication;

  dotenv.config();
  expressApp.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          connectSrc: [
            "'self'",
            'https://*.google-analytics.com',
            'https://*.analytics.google.com',
            'https://*.googletagmanager.com',
          ],
          scriptSrc: ["'self'", 'https://www.googletagmanager.com'],
          styleSrc: ["'self'", 'https://fonts.googleapis.com'],
          imgSrc: [
            "'self'",
            'data:',
            'https://*.google-analytics.com',
            'https://ssl.gstatic.com',
            'https://www.gstatic.com',
          ],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
    }),
  );
  app.use(bodyParser.json());
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  return expressApp;
}

async function createAppInstance() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  setupMiddlewares(app);

  return app;
}

async function bootstrap() {
  const app = await createAppInstance();

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Server is running on PORT: ${port}`);
}

bootstrap();
