import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { ChargeStatus } from '../enums/charge-status.enum';

@Entity('charges')
export class Charge extends BaseEntity {
  @Column({ type: 'numeric', precision: 12, scale: 0 })
  amount: number;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({
    type: 'enum',
    enum: ChargeStatus,
    default: ChargeStatus.CREATED,
  })
  status: ChargeStatus;

  @Column({ name: 'idempotency_key', type: 'varchar', nullable: true })
  idempotencyKey: string;

  @Column({ name: 'customer_email', type: 'varchar' })
  customerEmail: string;
}
