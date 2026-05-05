import { Module } from '@nestjs/common';
import { BaseEntity } from './base.entity'; // Import BaseEntity here if needed for providers, though it's abstract

@Module({
  // providers: [BaseEntity], // Abstract classes cannot be providers directly.
  // exports: [BaseEntity], // Abstract classes cannot be exported directly.
})
export class CommonDomainModule {}
