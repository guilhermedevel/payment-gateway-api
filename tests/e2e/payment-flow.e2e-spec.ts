import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('Payment Flow (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    // Connect to RabbitMQ microservice
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
        queue: process.env.RABBITMQ_QUEUE || 'charges_queue',
        queueOptions: {
          durable: true,
        },
      },
    });

    await app.startAllMicroservices();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a charge and eventually process it', async () => {
    const idempotencyKey = `e2e-test-${Date.now()}`;
    const chargePayload = {
      amount: 10000, // 100.00
      currency: 'BRL',
      customerEmail: 'e2e@test.com',
    };

    // 1. Create Charge
    const createResponse = await request(app.getHttpServer())
      .post('/charges')
      .set('Idempotency-Key', idempotencyKey)
      .send(chargePayload);

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toHaveProperty('id');
    expect(createResponse.body.status).toBe('created');
    const chargeId = createResponse.body.id;

    // 2. Poll for status change (wait for processor)
    let status = 'created';
    let attempts = 0;
    const maxAttempts = 10;

    while ((status === 'created' || status === 'processing') && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const getResponse = await request(app.getHttpServer()).get(`/charges/${chargeId}`);
      status = getResponse.body.status;
      attempts++;
    }

    expect(['approved', 'denied']).toContain(status);

    // 3. Verify history
    const historyResponse = await request(app.getHttpServer()).get(`/charges/${chargeId}`);
    expect(historyResponse.body).toHaveProperty('history');
    expect(historyResponse.body.history.length).toBeGreaterThanOrEqual(2); // created -> (processing) -> approved/denied
  }, 15000); // Higher timeout for async processing

  it('should respect idempotency in full flow', async () => {
    const idempotencyKey = `e2e-idemp-${Date.now()}`;
    const chargePayload = {
      amount: 500,
      currency: 'USD',
      customerEmail: 'idemp@test.com',
    };

    // First request
    const response1 = await request(app.getHttpServer())
      .post('/charges')
      .set('Idempotency-Key', idempotencyKey)
      .send(chargePayload);

    expect(response1.status).toBe(201);
    const id1 = response1.body.id;

    // Immediate second request
    const response2 = await request(app.getHttpServer())
      .post('/charges')
      .set('Idempotency-Key', idempotencyKey)
      .send(chargePayload);

    expect(response2.status).toBe(201);
    expect(response2.body.id).toBe(id1);
  });
});
