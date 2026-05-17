import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ChargesController } from '../../../src/app/controllers/charges.controller';
import { CreateChargeUseCase } from '../../../src/use-cases/create-charge.use-case';
import { GetChargeUseCase } from '../../../src/use-cases/get-charge.use-case';
import { ListChargesUseCase } from '../../../src/use-cases/list-charges.use-case';
import { IdempotencyInterceptor } from '../../../src/common/interceptors/idempotency.interceptor';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IdempotencyRecord } from '../../../src/domain/entities/idempotency-record.entity';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateHash } from '../../../src/common/utils/hash.util';

describe('Idempotency Integration', () => {
  let app: INestApplication;
  let createChargeUseCase: any;
  let idempotencyRepository: any;

  beforeEach(async () => {
    const createChargeUseCaseMock = {
      execute: vi.fn(),
    };

    const getChargeUseCaseMock = {
      execute: vi.fn(),
    };

    const listChargesUseCaseMock = {
      execute: vi.fn(),
    };

    const idempotencyRepositoryMock = {
      findOne: vi.fn(),
      save: vi.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ChargesController],
      providers: [
        {
          provide: CreateChargeUseCase,
          useValue: createChargeUseCaseMock,
        },
        {
          provide: GetChargeUseCase,
          useValue: getChargeUseCaseMock,
        },
        {
          provide: ListChargesUseCase,
          useValue: listChargesUseCaseMock,
        },
        {
          provide: getRepositoryToken(IdempotencyRecord),
          useValue: idempotencyRepositoryMock,
        },
        IdempotencyInterceptor,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    
    createChargeUseCase = moduleFixture.get<CreateChargeUseCase>(CreateChargeUseCase);
    idempotencyRepository = moduleFixture.get(getRepositoryToken(IdempotencyRecord));
  });

  it('should save and replay response on subsequent identical requests', async () => {
    const idempotencyKey = 'unique-key';
    const payload = {
      amount: 5000,
      currency: 'BRL',
      customerEmail: 'test@example.com',
    };
    const responseBody = { id: 'uuid', ...payload, status: 'created' };

    // First request: Not in DB
    idempotencyRepository.findOne.mockResolvedValue(null);
    createChargeUseCase.execute.mockResolvedValue(responseBody);
    idempotencyRepository.save.mockResolvedValue({});

    const response1 = await request(app.getHttpServer())
      .post('/charges')
      .set('Idempotency-Key', idempotencyKey)
      .send(payload);

    expect(response1.status).toBe(201);
    expect(response1.body).toEqual(responseBody);
    expect(idempotencyRepository.save).toHaveBeenCalled();

    // Second request: Found in DB
    idempotencyRepository.findOne.mockResolvedValue({
      key: idempotencyKey,
      requestHash: generateHash(payload),
      responseCode: 201,
      responseBody,
      expiresAt: new Date(Date.now() + 10000),
    });

    const response2 = await request(app.getHttpServer())
      .post('/charges')
      .set('Idempotency-Key', idempotencyKey)
      .send(payload);

    expect(response2.status).toBe(201);
    expect(response2.body).toEqual(responseBody);
    expect(createChargeUseCase.execute).toHaveBeenCalledTimes(1); // Only called once (the first time)
  });

  it('should return 409 Conflict if payload differs for same Idempotency-Key', async () => {
    const idempotencyKey = 'shared-key';
    const payload1 = { amount: 1000 };
    const payload2 = { amount: 2000 };

    idempotencyRepository.findOne.mockResolvedValue({
      key: idempotencyKey,
      requestHash: generateHash(payload1),
      responseCode: 201,
      responseBody: { id: '1' },
      expiresAt: new Date(Date.now() + 10000),
    });

    const response = await request(app.getHttpServer())
      .post('/charges')
      .set('Idempotency-Key', idempotencyKey)
      .send(payload2);

    expect(response.status).toBe(409);
    expect(response.body.message).toContain('Idempotency-Key mismatch');
  });
});
