import { Test, TestingModule } from '@nestjs/testing';
import { CreateChargeUseCase } from '../../../src/use-cases/create-charge.use-case';
import { IChargeRepository } from '../../../src/domain/repositories/charge.repository.interface';
import { ChargeStatus } from '../../../src/domain/enums/charge-status.enum';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi, MockInstance } from 'vitest';

describe('CreateChargeUseCase', () => {
  let useCase: CreateChargeUseCase;
  let repository: any;
  let clientProxy: any;

  beforeEach(async () => {
    const repositoryMock = {
      create: vi.fn(),
      save: vi.fn(),
    };

    const clientProxyMock = {
      emit: vi.fn().mockReturnValue(of({})),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateChargeUseCase,
        {
          provide: IChargeRepository,
          useValue: repositoryMock,
        },
        {
          provide: 'CHARGES_SERVICE',
          useValue: clientProxyMock,
        },
      ],
    }).compile();

    useCase = module.get<CreateChargeUseCase>(CreateChargeUseCase);
    repository = module.get(IChargeRepository);
    clientProxy = module.get('CHARGES_SERVICE');
  });

  it('should create and save a charge, then emit a message', async () => {
    const chargeData = {
      amount: 5000,
      currency: 'BRL',
      customerEmail: 'test@example.com',
      idempotencyKey: 'unique-key',
    };

    const savedCharge = {
      id: 'uuid',
      ...chargeData,
      status: ChargeStatus.CREATED,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    repository.create.mockReturnValue(savedCharge);
    repository.save.mockResolvedValue(savedCharge);

    const result = await useCase.execute(chargeData);

    expect(repository.create).toHaveBeenCalledWith({
      ...chargeData,
      status: ChargeStatus.CREATED,
    });
    expect(repository.save).toHaveBeenCalledWith(savedCharge);
    expect(clientProxy.emit).toHaveBeenCalledWith('charge_created', {
      chargeId: savedCharge.id,
    });
    expect(result).toEqual(savedCharge);
  });
});
