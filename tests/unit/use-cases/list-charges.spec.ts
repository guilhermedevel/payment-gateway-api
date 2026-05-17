import { Test, TestingModule } from '@nestjs/testing';
import { ListChargesUseCase } from '../../../src/use-cases/list-charges.use-case';
import { IChargeRepository } from '../../../src/domain/repositories/charge.repository.interface';
import { ChargeStatus } from '../../../src/domain/enums/charge-status.enum';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ListChargesUseCase', () => {
  let useCase: ListChargesUseCase;
  let repository: any;

  beforeEach(async () => {
    const repositoryMock = {
      findAll: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListChargesUseCase,
        {
          provide: IChargeRepository,
          useValue: repositoryMock,
        },
      ],
    }).compile();

    useCase = module.get<ListChargesUseCase>(ListChargesUseCase);
    repository = module.get(IChargeRepository);
  });

  it('should return all charges', async () => {
    const charges = [
      {
        id: 'uuid-1',
        amount: 1000,
        currency: 'BRL',
        status: ChargeStatus.APPROVED,
        createdAt: new Date(),
      },
      {
        id: 'uuid-2',
        amount: 2000,
        currency: 'BRL',
        status: ChargeStatus.CREATED,
        createdAt: new Date(),
      },
    ];

    repository.findAll.mockResolvedValue(charges);

    const result = await useCase.execute();

    expect(repository.findAll).toHaveBeenCalled();
    expect(result).toEqual(charges);
  });
});
