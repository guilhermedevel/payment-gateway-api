import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ChargesController } from '../../../src/app/controllers/charges.controller';
import { CreateChargeUseCase } from '../../../src/use-cases/create-charge.use-case';
import { GetChargeUseCase } from '../../../src/use-cases/get-charge.use-case';
import { ListChargesUseCase } from '../../../src/use-cases/list-charges.use-case';
import { ChargeStatus } from '../../../src/domain/enums/charge-status.enum';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IdempotencyRecord } from '../../../src/domain/entities/idempotency-record.entity';
import { IdempotencyInterceptor } from '../../../src/common/interceptors/idempotency.interceptor';

describe('ChargesController (Contract Queries)', () => {
  let app: INestApplication;
  let getChargeUseCase: any;
  let listChargesUseCase: any;

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
    getChargeUseCase = moduleFixture.get<GetChargeUseCase>(GetChargeUseCase);
    listChargesUseCase = moduleFixture.get<ListChargesUseCase>(ListChargesUseCase);
  });

  it('GET /charges/:id should return 200 and the charge with history', async () => {
    const chargeWithHistory = {
      id: 'uuid-123',
      amount: 1000,
      currency: 'BRL',
      status: ChargeStatus.APPROVED,
      history: [
        {
          action: 'CHARGE_CREATED',
          new_status: 'created',
          timestamp: '2026-04-19T10:00:00Z',
        },
      ],
    };

    getChargeUseCase.execute.mockResolvedValue(chargeWithHistory);

    const response = await request(app.getHttpServer()).get('/charges/uuid-123');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(chargeWithHistory);
    expect(getChargeUseCase.execute).toHaveBeenCalledWith('uuid-123');
  });

  it('GET /charges should return 200 and the list of charges', async () => {
    const chargesList = [
      {
        id: 'uuid-123',
        amount: 1000,
        currency: 'BRL',
        status: ChargeStatus.APPROVED,
        created_at: '2026-04-19T10:00:00Z',
      },
    ];

    listChargesUseCase.execute.mockResolvedValue(chargesList);

    const response = await request(app.getHttpServer()).get('/charges');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(chargesList);
    expect(listChargesUseCase.execute).toHaveBeenCalled();
  });
});
