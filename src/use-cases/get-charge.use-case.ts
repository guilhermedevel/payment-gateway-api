import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IChargeRepository } from '../domain/repositories/charge.repository.interface';
import { IAuditLogRepository } from '../domain/repositories/audit-log.repository.interface';

@Injectable()
export class GetChargeUseCase {
  constructor(
    @Inject(IChargeRepository)
    private readonly chargeRepository: IChargeRepository,
    @Inject(IAuditLogRepository)
    private readonly auditLogRepository: IAuditLogRepository,
  ) {}

  async execute(id: string) {
    const charge = await this.chargeRepository.findById(id);

    if (!charge) {
      throw new NotFoundException(`Charge with ID ${id} not found`);
    }

    const history = await this.auditLogRepository.findByChargeId(id);

    return {
      ...charge,
      history: history.map((h) => ({
        action: h.action,
        previous_status: h.previousStatus,
        new_status: h.newStatus,
        timestamp: h.timestamp,
      })),
    };
  }
}
