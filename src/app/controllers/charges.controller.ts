import { Controller, Post, Body, Headers, HttpCode, UseInterceptors } from '@nestjs/common';
import { CreateChargeUseCase, CreateChargeDto } from '../../use-cases/create-charge.use-case';
import { IdempotencyInterceptor } from '../../common/interceptors/idempotency.interceptor';

@Controller('charges')
export class ChargesController {
  constructor(private readonly createChargeUseCase: CreateChargeUseCase) {}

  @Post()
  @UseInterceptors(IdempotencyInterceptor)
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
