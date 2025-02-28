import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { toInteger } from 'lodash';
import morgan, { TokenIndexer } from 'morgan';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    morgan(
      (tokens: TokenIndexer, req: Request, res: Response) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = (req as any)?.user?.email || 'anonymous';
        return JSON.stringify({
          user: user,
          host: tokens['remote-addr'](req, res),
          method: tokens.method(req, res),
          path: tokens.url(req, res),
          duration: toInteger(tokens['response-time'](req, res)) + ' ms',
          agent: tokens['user-agent'](req, res),
          referrer: tokens.referrer(req, res),
          code: toInteger(tokens.status(req, res)),
        });
      },
      {
        stream: {
          write: (message: string) => this.logMessage(message),
        },
      },
    )(req, res, next);
  }

  private logMessage(message: string) {
    console.log('LoggerMiddleware@logMessage:', JSON.parse(message));
  }
}
