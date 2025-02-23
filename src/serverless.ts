import { NestFactory } from '@nestjs/core';
import serverlessExpress from '@codegenie/serverless-express';
import { APIGatewayProxyEvent, Callback, Context, Handler } from 'aws-lambda';
import { AppModule } from './app.module';
import { firstValueFrom, ReplaySubject } from 'rxjs';
import { setupMiddlewares } from './main';

const serverSubject = new ReplaySubject<Handler>();

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(AppModule);
  setupMiddlewares(app);
  await app.init();
  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

bootstrap().then((server) => serverSubject.next(server));

export const handler: Handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback,
) => {
  if (event.path === '' || event.path === undefined) event.path = '/';
  const server = await firstValueFrom(serverSubject);
  return server(event, context, callback);
};
