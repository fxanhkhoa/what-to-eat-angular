/**
 * Generates a random number between n and m (inclusive).
 *
 * @param n The lower bound of the range.
 * @param m The upper bound of the range.
 * @returns A random number between n and m (inclusive).
 */
export function randomNumber(n: number, m: number): number {
  // Ensure n is less than or equal to m
  if (n > m) {
    [n, m] = [m, n]; // Swap values if n is greater than m
  }

  return Math.floor(Math.random() * (m - n + 1)) + n;
}
