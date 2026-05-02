import { Controller, Inject } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { IChargeRepository } from '../../domain/repositories/charge.repository.interface';
import { ChargeStatus } from '../../domain/enums/charge-status.enum';

@Controller()
export class ChargeProcessor {
  constructor(
    @Inject(IChargeRepository)
    private readonly chargeRepository: IChargeRepository,
  ) {}

  @EventPattern('charge_created')
  async handleChargeCreated(@Payload() data: { chargeId: string }) {
    const charge = await this.chargeRepository.findById(data.chargeId);

    if (!charge) {
      console.error(`Charge with ID ${data.chargeId} not found`);
      return;
    }

    // Update status to PROCESSING
    charge.status = ChargeStatus.PROCESSING;
    await this.chargeRepository.save(charge);

    // Simulate fake processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Randomly approve or deny
    const isApproved = Math.random() > 0.2; // 80% approval rate
    charge.status = isApproved ? ChargeStatus.APPROVED : ChargeStatus.DENIED;

    await this.chargeRepository.save(charge);
  }
}
