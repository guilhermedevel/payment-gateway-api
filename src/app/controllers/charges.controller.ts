import { Controller, Post, Get, Body, Param, Headers, HttpCode, UseInterceptors } from '@nestjs/common';
import { CreateChargeUseCase, CreateChargeDto } from '../../use-cases/create-charge.use-case';
import { GetChargeUseCase } from '../../use-cases/get-charge.use-case';
import { ListChargesUseCase } from '../../use-cases/list-charges.use-case';
import { IdempotencyInterceptor } from '../../common/interceptors/idempotency.interceptor';

@Controller('charges')
export class ChargesController {
  constructor(
    private readonly createChargeUseCase: CreateChargeUseCase,
    private readonly getChargeUseCase: GetChargeUseCase,
    private readonly listChargesUseCase: ListChargesUseCase,
  ) {}

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

  @Get()
  async findAll() {
    return this.listChargesUseCase.execute();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.getChargeUseCase.execute(id);
  }
}
