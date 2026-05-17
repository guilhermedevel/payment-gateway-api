import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateIdempotencyRecordsTable1777937660000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'idempotency_records',
        columns: [
          {
            name: 'key',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'response_code',
            type: 'integer',
          },
          {
            name: 'response_body',
            type: 'jsonb',
          },
          {
            name: 'request_hash',
            type: 'varchar',
          },
          {
            name: 'expires_at',
            type: 'timestamp',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('idempotency_records');
  }
}
