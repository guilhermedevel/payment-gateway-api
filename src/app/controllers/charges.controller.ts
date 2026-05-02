import { Controller, Post, Body, Headers, HttpCode } from '@nestjs/common';
import { CreateChargeUseCase, CreateChargeDto } from '../../use-cases/create-charge.use-case';

@Controller('charges')
export class ChargesController {
  constructor(private readonly createChargeUseCase: CreateChargeUseCase) {}

  @Post()
  @HttpCode(201)
  async create(
    @Body() dto: CreateChargeDto,
    @Headers('Idempotency-Key') idempotencyKey?: string,
  ) {
    return this.createChargeUseCase.execute({
      ...dto,
      idempotencyKey,
    });
  }
}
