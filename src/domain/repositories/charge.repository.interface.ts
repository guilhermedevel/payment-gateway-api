import { Charge } from '../entities/charge.entity';

export interface IChargeRepository {
  create(charge: Partial<Charge>): Promise<Charge>;
  findById(id: string): Promise<Charge | null>;
  save(charge: Charge): Promise<Charge>;
  findAll(): Promise<Charge[]>;
}

export const IChargeRepository = Symbol('IChargeRepository');
