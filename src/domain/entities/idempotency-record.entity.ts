import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('idempotency_records')
export class IdempotencyRecord {
  @PrimaryColumn({ type: 'varchar' })
  key: string;

  @Column({ name: 'response_code', type: 'integer' })
  responseCode: number;

  @Column({ name: 'response_body', type: 'jsonb' })
  responseBody: any;

  @Column({ name: 'request_hash', type: 'varchar' })
  requestHash: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;
}
