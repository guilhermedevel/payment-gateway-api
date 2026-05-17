# Payment Gateway API

A prototype payment gateway API built with NestJS, following Clean Architecture principles.

## Features

- **Charge Creation**: Asynchronous processing of charges via RabbitMQ.
- **Idempotency**: Robust protection against duplicate charge requests using SHA-256 payload verification.
- **Audit Logging**: Comprehensive tracking of all charge lifecycle events.
- **Status Lifecycle**: `created` -> `processing` -> `approved` or `denied`.
- **Transaction History**: Query status and full audit trail for any transaction.

## Overview

This project implements a prototype payment gateway that provides robust charge processing with a focus on reliability and traceability. It utilizes an asynchronous architecture where charges are accepted via REST and processed by a background worker through a message queue (RabbitMQ).

Key technical features include:
- **Idempotent Operations**: Uses `Idempotency-Key` headers with SHA-256 payload hashing to prevent duplicate billing and ensure request integrity.
- **Audit Traceability**: Every transaction follows a strict lifecycle (`created` -> `processing` -> `approved`/`denied`) with every transition recorded in an immutable audit log.
- **Clean Architecture**: Follows SOLID principles and Clean Architecture, separating core domain logic from infrastructure details like TypeORM and NestJS.

## Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL (TypeORM)
- **Messaging**: RabbitMQ
- **Testing**: Vitest
- **Infrastructure**: Docker Compose

## Quick Start

To get the project running locally, follow these steps:

```bash
# Install dependencies
npm install

# Start infrastructure (Postgres & RabbitMQ)
docker-compose up -d

# Run migrations
npm run migration:run

# Start the API
npm run start:dev
```

## Testing

```bash
# Unit tests
npm run test

# Integration tests
npm run test:int

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## License

MIT
