import { Test, TestingModule } from '@nestjs/testing';
import { IdempotencyInterceptor } from '../../../src/common/interceptors/idempotency.interceptor';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IdempotencyRecord } from '../../../src/domain/entities/idempotency-record.entity';
import { ExecutionContext, CallHandler, ConflictException } from '@nestjs/common';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateHash } from '../../../src/common/utils/hash.util';

describe('IdempotencyInterceptor', () => {
  let interceptor: IdempotencyInterceptor;
  let repository: any;

  beforeEach(async () => {
    const repositoryMock = {
      findOne: vi.fn(),
      save: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IdempotencyInterceptor,
        {
          provide: getRepositoryToken(IdempotencyRecord),
          useValue: repositoryMock,
        },
      ],
    }).compile();

    interceptor = module.get<IdempotencyInterceptor>(IdempotencyInterceptor);
    repository = module.get(getRepositoryToken(IdempotencyRecord));
  });

  it('should continue if no Idempotency-Key header is present', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: {}, body: {} }),
        getResponse: () => ({}),
      }),
    } as unknown as ExecutionContext;

    const next = {
      handle: () => of('response'),
    } as CallHandler;

    const result = await interceptor.intercept(context, next).toPromise();
    expect(result).toBe('response');
    expect(repository.findOne).not.toHaveBeenCalled();
  });

  it('should replay response if Idempotency-Key exists and hash matches', async () => {
    const idempotencyKey = 'test-key';
    const body = { amount: 1000 };
    const requestHash = generateHash(body);
    
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { 'idempotency-key': idempotencyKey },
          body,
        }),
        getResponse: () => ({
          status: vi.fn().mockReturnThis(),
        }),
      }),
    } as unknown as ExecutionContext;

    const next = { handle: vi.fn() } as CallHandler;

    repository.findOne.mockResolvedValue({
      key: idempotencyKey,
      requestHash,
      responseCode: 201,
      responseBody: { id: '123' },
      expiresAt: new Date(Date.now() + 10000),
    });

    const result = await interceptor.intercept(context, next).toPromise();
    
    expect(result).toEqual({ id: '123' });
    expect(next.handle).not.toHaveBeenCalled();
  });

  it('should throw ConflictException if Idempotency-Key exists but hash mismatches', async () => {
    const idempotencyKey = 'test-key';
    const body = { amount: 2000 };
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { 'idempotency-key': idempotencyKey },
          body,
        }),
        getResponse: () => ({}),
      }),
    } as unknown as ExecutionContext;

    const next = { handle: vi.fn() } as CallHandler;

    repository.findOne.mockResolvedValue({
      key: idempotencyKey,
      requestHash: 'different-hash',
      expiresAt: new Date(Date.now() + 10000),
    });

    await expect(interceptor.intercept(context, next).toPromise()).rejects.toThrow(ConflictException);
  });

  it('should save response if Idempotency-Key is new', async () => {
    const idempotencyKey = 'new-key';
    const body = { amount: 3000 };
    const response = { id: '456' };
    
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { 'idempotency-key': idempotencyKey },
          body,
        }),
        getResponse: () => ({
          statusCode: 201,
        }),
      }),
    } as unknown as ExecutionContext;

    const next = {
      handle: () => of(response),
    } as CallHandler;

    repository.findOne.mockResolvedValue(null);
    repository.save.mockResolvedValue({});

    const result = await interceptor.intercept(context, next).toPromise();
    
    expect(result).toBe(response);
    expect(repository.save).toHaveBeenCalled();
    const saveCall = repository.save.mock.calls[0][0];
    expect(saveCall.key).toBe(idempotencyKey);
    expect(saveCall.responseBody).toEqual(response);
    expect(saveCall.requestHash).toBe(generateHash(body));
  });
});
