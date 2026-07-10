/** Generates a UUID, used for optimistic ids in demo mode. */
export function uuid(): string {
  return crypto.randomUUID()
}
