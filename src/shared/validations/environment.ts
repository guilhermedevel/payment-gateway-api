import * as z from 'zod';

export const EnvironmentSchema = z.object({
  PORT: z.string().default('3000'),

  DATABASE_HOST: z.string(),
  DATABASE_NAME: z.string(),
  DATABASE_PORT: z.string().default('5432'),
  DATABASE_USER: z.string(),
  DATABASE_PASSWORD: z.string(),
  DATABASE_CERTIFICATE: z.string().optional(),

  RABBITMQ_URL: z.string(),
  RABBITMQ_QUEUE: z.string(),
});

export type EnvironmentSchemaType = z.output<typeof EnvironmentSchema>;