import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../domain/entities/audit-log.entity';
import { IAuditLogRepository } from '../../domain/repositories/audit-log.repository.interface';

@Injectable()
export class TypeORMAuditLogRepository implements IAuditLogRepository {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repository: Repository<AuditLog>,
  ) {}

  async findByChargeId(chargeId: string): Promise<AuditLog[]> {
    return this.repository.find({
      where: { chargeId },
      order: { timestamp: 'ASC' },
    });
  }
}
