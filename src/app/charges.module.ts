import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Charge } from '../domain/entities/charge.entity';
import { AuditLog } from '../domain/entities/audit-log.entity';
import { ChargesController } from './controllers/charges.controller';
import { CreateChargeUseCase } from '../use-cases/create-charge.use-case';
import { ChargeProcessor } from '../infrastructure/queue/charge.processor';
import { TypeORMChargeRepository } from '../infrastructure/repositories/typeorm-charge.repository';
import { IChargeRepository } from '../domain/repositories/charge.repository.interface';
import { AuditLogSubscriber } from '../infrastructure/subscribers/audit-log.subscriber';

@Module({
  imports: [TypeOrmModule.forFeature([Charge, AuditLog])],
  controllers: [ChargesController, ChargeProcessor],
  providers: [
    CreateChargeUseCase,
    AuditLogSubscriber,
    {
      provide: IChargeRepository,
      useClass: TypeORMChargeRepository,
    },
  ],
  exports: [IChargeRepository],
})
export class ChargesModule {}
