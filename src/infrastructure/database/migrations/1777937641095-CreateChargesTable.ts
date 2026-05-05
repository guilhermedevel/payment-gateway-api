import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateChargesTable1777937641095 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`CREATE TYPE "charges_status_enum" AS ENUM('created', 'processing', 'approved', 'denied')`);
        
        await queryRunner.createTable(new Table({
            name: "charges",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "uuid",
                    default: "uuid_generate_v4()",
                },
                {
                    name: "amount",
                    type: "numeric",
                    precision: 12,
                    scale: 0,
                },
                {
                    name: "currency",
                    type: "varchar",
                    length: "3",
                },
                {
                    name: "status",
                    type: "enum",
                    enum: ['created', 'processing', 'approved', 'denied'],
                    enumName: "charges_status_enum",
                    default: "'created'",
                },
                {
                    name: "idempotency_key",
                    type: "varchar",
                    isNullable: true,
                },
                {
                    name: "customer_email",
                    type: "varchar",
                },
                {
                    name: "createdAt",
                    type: "timestamp with time zone",
                    default: "now()",
                },
                {
                    name: "updatedAt",
                    type: "timestamp with time zone",
                    default: "now()",
                }
            ]
        }), true);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("charges");
        await queryRunner.query(`DROP TYPE "charges_status_enum"`);
    }

}
