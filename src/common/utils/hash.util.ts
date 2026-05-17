import { createHash } from 'crypto';

/**
 * Generates a SHA-256 hash of the given payload.
 * Used for detecting request mismatches with the same idempotency key.
 */
export function generateHash(payload: any): string {
  const content = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return createHash('sha256').update(content).digest('hex');
}
