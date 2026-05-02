import { Test, TestingModule } from '@nestjs/testing';
import { ChargeProcessor } from '../../../src/infrastructure/queue/charge.processor';
import { IChargeRepository } from '../../../src/domain/repositories/charge.repository.interface';
import { ChargeStatus } from '../../../src/domain/enums/charge-status.enum';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ChargeProcessor', () => {
  let processor: ChargeProcessor;
  let repository: any;

  beforeEach(async () => {
    const repositoryMock = {
      findById: vi.fn(),
      save: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChargeProcessor,
        {
          provide: IChargeRepository,
          useValue: repositoryMock,
        },
      ],
    }).compile();

    processor = module.get<ChargeProcessor>(ChargeProcessor);
    repository = module.get(IChargeRepository);
  });

  it('should process a charge and update status to approved or denied', async () => {
    const charge = {
      id: 'uuid',
      status: ChargeStatus.CREATED,
      save: vi.fn(),
    };

    repository.findById.mockResolvedValue(charge);
    repository.save.mockResolvedValue(charge);

    await processor.handleChargeCreated({ chargeId: 'uuid' });

    expect(repository.findById).toHaveBeenCalledWith('uuid');
    expect(repository.save).toHaveBeenCalled();
    expect([ChargeStatus.APPROVED, ChargeStatus.DENIED]).toContain(charge.status);
  });
});
