/**
 * Minimal className combiner: filters out falsy values and joins with spaces.
 * Keeps components dependency-free while allowing conditional classes.
 */
export type ClassValue = string | false | null | undefined

export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ')
}
