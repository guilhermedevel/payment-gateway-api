import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateAuditLogsTable1777937656605 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "audit_logs_action_enum" AS ENUM('CHARGE_CREATED', 'STATUS_UPDATED')`);

        await queryRunner.createTable(new Table({
            name: "audit_logs",
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
                    name: "charge_id",
                    type: "uuid",
                },
                {
                    name: "action",
                    type: "enum",
                    enum: ['CHARGE_CREATED', 'STATUS_UPDATED'],
                    enumName: "audit_logs_action_enum",
                },
                {
                    name: "previous_status",
                    type: "enum",
                    enum: ['created', 'processing', 'approved', 'denied'],
                    enumName: "charges_status_enum",
                    isNullable: true,
                },
                {
                    name: "new_status",
                    type: "enum",
                    enum: ['created', 'processing', 'approved', 'denied'],
                    enumName: "charges_status_enum",
                    isNullable: true,
                },
                {
                    name: "metadata",
                    type: "jsonb",
                    isNullable: true,
                },
                {
                    name: "timestamp",
                    type: "timestamp with time zone",
                    default: "now()",
                }
            ]
        }), true);

        await queryRunner.createForeignKey("audit_logs", new TableForeignKey({
            columnNames: ["charge_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "charges",
            onDelete: "CASCADE"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("audit_logs");
        await queryRunner.query(`DROP TYPE "audit_logs_action_enum"`);
    }

}
