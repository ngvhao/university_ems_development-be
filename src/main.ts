import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './exceptions/global.exception';
import * as dotenv from 'dotenv';
import {
  BadRequestException,
  INestApplication,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import * as bodyParser from 'body-parser';
import { API_PREFIX_PATH } from './utils/constants';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  const apiPath = `${API_PREFIX_PATH}/docs`;

  const config = new DocumentBuilder()
    .setTitle('Xypass')
    .setDescription('Xypass project')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', in: 'header' }, 'token')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(apiPath, app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  app.use(bodyParser.json());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors: ValidationError[]) => {
        const validationErrors = errors.map((error) => {
          return {
            property: error.property,
            value: error.value ?? null,
            constraints: error.constraints,
          };
        });
        return new BadRequestException({
          message: 'Validation failed!',
          errors: validationErrors,
        });
      },
    }),
  );
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
  console.log(`Server is running on PORT: ${port}`);
}

bootstrap();
