import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { ChargeStatus } from '../enums/charge-status.enum';
import { AuditLogAction } from '../enums/audit-log-action.enum';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'charge_id', type: 'uuid' })
  chargeId: string;

  @Column({
    type: 'enum',
    enum: AuditLogAction,
  })
  action: AuditLogAction;

  @Column({
    name: 'previous_status',
    type: 'enum',
    enum: ChargeStatus,
    nullable: true,
  })
  previousStatus: ChargeStatus;

  @Column({
    name: 'new_status',
    type: 'enum',
    enum: ChargeStatus,
    nullable: true,
  })
  newStatus: ChargeStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
}
