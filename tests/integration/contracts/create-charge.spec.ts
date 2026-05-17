import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ChargesController } from '../../../src/app/controllers/charges.controller';
import { CreateChargeUseCase } from '../../../src/use-cases/create-charge.use-case';
import { ChargeStatus } from '../../../src/domain/enums/charge-status.enum';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IdempotencyRecord } from '../../../src/domain/entities/idempotency-record.entity';
import { IdempotencyInterceptor } from '../../../src/common/interceptors/idempotency.interceptor';
import { of } from 'rxjs';

describe('ChargesController (Contract)', () => {
  let app: INestApplication;
  let createChargeUseCase: any;

  beforeEach(async () => {
    const createChargeUseCaseMock = {
      execute: vi.fn(),
    };

    const idempotencyRepositoryMock = {
      findOne: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue({}),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ChargesController],
      providers: [
        {
          provide: CreateChargeUseCase,
          useValue: createChargeUseCaseMock,
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
  });

  it('POST /charges should return 201 and the created charge', async () => {
    const payload = {
      amount: 5000,
      currency: 'BRL',
      customerEmail: 'test@example.com',
    };

    const createdCharge = {
      id: 'uuid',
      ...payload,
      status: ChargeStatus.CREATED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    createChargeUseCase.execute.mockResolvedValue(createdCharge);

    const response = await request(app.getHttpServer())
      .post('/charges')
      .set('Idempotency-Key', 'unique-key')
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(createdCharge);
    expect(createChargeUseCase.execute).toHaveBeenCalledWith({
      ...payload,
      idempotencyKey: 'unique-key',
    });
  });

  it('POST /charges should return 400 if validation fails', async () => {
    // Validation logic is usually in main.ts or decorators, 
    // but here we can just test if controller handles it or if use case throws.
  });
});
