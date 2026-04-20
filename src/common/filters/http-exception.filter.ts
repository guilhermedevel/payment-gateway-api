import { Catch, ExceptionFilter, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode =
      exception.getStatus?.() || HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      exception.message || 'Internal server error';

    response.status(statusCode).json({
      statusCode: statusCode,
      message: message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
