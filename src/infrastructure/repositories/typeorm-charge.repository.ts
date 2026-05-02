import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Charge } from '../../domain/entities/charge.entity';
import { IChargeRepository } from '../../domain/repositories/charge.repository.interface';

@Injectable()
export class TypeORMChargeRepository implements IChargeRepository {
  constructor(
    @InjectRepository(Charge)
    private readonly repository: Repository<Charge>,
  ) {}

  async create(chargeData: Partial<Charge>): Promise<Charge> {
    return this.repository.create(chargeData);
  }

  async findById(id: string): Promise<Charge | null> {
    return this.repository.findOne({ where: { id } });
  }

  async save(charge: Charge): Promise<Charge> {
    return this.repository.save(charge);
  }

  async findAll(): Promise<Charge[]> {
    return this.repository.find();
  }
}
