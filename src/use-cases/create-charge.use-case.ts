import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ChargeStatus } from '../domain/enums/charge-status.enum';
import { IChargeRepository } from '../domain/repositories/charge.repository.interface';
import { Charge } from '../domain/entities/charge.entity';

export interface CreateChargeDto {
  amount: number;
  currency: string;
  customerEmail: string;
  idempotencyKey?: string;
}

@Injectable()
export class CreateChargeUseCase {
  constructor(
    @Inject(IChargeRepository)
    private readonly chargeRepository: IChargeRepository,
    @Inject('CHARGES_SERVICE')
    private readonly clientProxy: ClientProxy,
  ) {}

  async execute(dto: CreateChargeDto): Promise<Charge> {
    const charge = await this.chargeRepository.create({
      amount: dto.amount,
      currency: dto.currency,
      customerEmail: dto.customerEmail,
      idempotencyKey: dto.idempotencyKey,
      status: ChargeStatus.CREATED,
    });

    const savedCharge = await this.chargeRepository.save(charge);

    this.clientProxy.emit('charge_created', {
      chargeId: savedCharge.id,
    });

    return savedCharge;
  }
}
