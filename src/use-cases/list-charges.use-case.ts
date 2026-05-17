import { Injectable, Inject } from '@nestjs/common';
import { IChargeRepository } from '../domain/repositories/charge.repository.interface';

@Injectable()
export class ListChargesUseCase {
  constructor(
    @Inject(IChargeRepository)
    private readonly chargeRepository: IChargeRepository,
  ) {}

  async execute() {
    return this.chargeRepository.findAll();
  }
}
