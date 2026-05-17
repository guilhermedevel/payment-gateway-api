import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable, of, from } from 'rxjs';
import { tap, mergeMap } from 'rxjs/operators';
import { IdempotencyRecord } from '../../domain/entities/idempotency-record.entity';
import { generateHash } from '../utils/hash.util';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(IdempotencyRecord)
    private readonly repository: Repository<IdempotencyRecord>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const idempotencyKey = request.headers['idempotency-key'];

    if (!idempotencyKey) {
      return next.handle();
    }

    const body = request.body;
    const requestHash = generateHash(body);

    return from(this.repository.findOne({ where: { key: idempotencyKey } })).pipe(
      mergeMap((record) => {
        if (record) {
          if (record.requestHash !== requestHash) {
            throw new ConflictException('Idempotency-Key mismatch with request payload');
          }

          // Replay the response
          if (response.status) {
            response.status(record.responseCode);
          }
          return of(record.responseBody);
        }

        return next.handle().pipe(
          tap(async (data) => {
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24);

            await this.repository.save({
              key: idempotencyKey,
              responseCode: response.statusCode,
              responseBody: data,
              requestHash,
              expiresAt,
            });
          }),
        );
      }),
    );
  }
}
