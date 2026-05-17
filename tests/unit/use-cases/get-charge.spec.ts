import { Test, TestingModule } from '@nestjs/testing';
import { GetChargeUseCase } from '../../../src/use-cases/get-charge.use-case';
import { IChargeRepository } from '../../../src/domain/repositories/charge.repository.interface';
import { IAuditLogRepository } from '../../../src/domain/repositories/audit-log.repository.interface';
import { ChargeStatus } from '../../../src/domain/enums/charge-status.enum';
import { AuditLogAction } from '../../../src/domain/enums/audit-log-action.enum';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';

describe('GetChargeUseCase', () => {
  let useCase: GetChargeUseCase;
  let chargeRepository: any;
  let auditLogRepository: any;

  beforeEach(async () => {
    const chargeRepositoryMock = {
      findById: vi.fn(),
    };

    const auditLogRepositoryMock = {
      findByChargeId: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetChargeUseCase,
        {
          provide: IChargeRepository,
          useValue: chargeRepositoryMock,
        },
        {
          provide: IAuditLogRepository,
          useValue: auditLogRepositoryMock,
        },
      ],
    }).compile();

    useCase = module.get<GetChargeUseCase>(GetChargeUseCase);
    chargeRepository = module.get(IChargeRepository);
    auditLogRepository = module.get(IAuditLogRepository);
  });

  it('should return charge with history if found', async () => {
    const charge = {
      id: 'uuid-123',
      amount: 1000,
      currency: 'BRL',
      status: ChargeStatus.APPROVED,
      customerEmail: 'user@example.com',
    };

    const history = [
      {
        action: AuditLogAction.CHARGE_CREATED,
        newStatus: ChargeStatus.CREATED,
        timestamp: new Date('2026-04-19T10:00:00Z'),
      },
      {
        action: AuditLogAction.STATUS_UPDATED,
        previousStatus: ChargeStatus.CREATED,
        newStatus: ChargeStatus.PROCESSING,
        timestamp: new Date('2026-04-19T10:01:00Z'),
      },
    ];

    chargeRepository.findById.mockResolvedValue(charge);
    auditLogRepository.findByChargeId.mockResolvedValue(history);

    const result = await useCase.execute('uuid-123');

    expect(chargeRepository.findById).toHaveBeenCalledWith('uuid-123');
    expect(auditLogRepository.findByChargeId).toHaveBeenCalledWith('uuid-123');
    expect(result).toEqual({
      ...charge,
      history: history.map(h => ({
        action: h.action,
        previous_status: h.previousStatus,
        new_status: h.newStatus,
        timestamp: h.timestamp,
      })),
    });
  });

  it('should throw NotFoundException if charge not found', async () => {
    chargeRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('uuid-123')).rejects.toThrow(NotFoundException);
  });
});
