import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Charge } from '../domain/entities/charge.entity';
import { AuditLog } from '../domain/entities/audit-log.entity';
import { IdempotencyRecord } from '../domain/entities/idempotency-record.entity';
import { ChargesController } from './controllers/charges.controller';
import { CreateChargeUseCase } from '../use-cases/create-charge.use-case';
import { GetChargeUseCase } from '../use-cases/get-charge.use-case';
import { ListChargesUseCase } from '../use-cases/list-charges.use-case';
import { ChargeProcessor } from '../infrastructure/queue/charge.processor';
import { TypeORMChargeRepository } from '../infrastructure/repositories/typeorm-charge.repository';
import { TypeORMAuditLogRepository } from '../infrastructure/repositories/typeorm-audit-log.repository';
import { IChargeRepository } from '../domain/repositories/charge.repository.interface';
import { IAuditLogRepository } from '../domain/repositories/audit-log.repository.interface';
import { AuditLogSubscriber } from '../infrastructure/subscribers/audit-log.subscriber';
import { IdempotencyInterceptor } from '../common/interceptors/idempotency.interceptor';

@Module({
  imports: [TypeOrmModule.forFeature([Charge, AuditLog, IdempotencyRecord])],
  controllers: [ChargesController, ChargeProcessor],
  providers: [
    CreateChargeUseCase,
    GetChargeUseCase,
    ListChargesUseCase,
    AuditLogSubscriber,
    IdempotencyInterceptor,
    {
      provide: IChargeRepository,
      useClass: TypeORMChargeRepository,
    },
    {
      provide: IAuditLogRepository,
      useClass: TypeORMAuditLogRepository,
    },
  ],
  exports: [IChargeRepository],
})
export class ChargesModule {}
