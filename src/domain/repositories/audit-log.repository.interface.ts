import { AuditLog } from '../entities/audit-log.entity';

export interface IAuditLogRepository {
  findByChargeId(chargeId: string): Promise<AuditLog[]>;
}

export const IAuditLogRepository = Symbol('IAuditLogRepository');
