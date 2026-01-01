/**
 * Shared network error detection utilities
 * Used across ticketbot and discordhooks to avoid code duplication
 */

export function isTransientNetworkError(err) {
  const code = err?.code;
  return code === 'ENOTFOUND' || code === 'EAI_AGAIN' || code === 'ECONNRESET' || code === 'ETIMEDOUT';
}

export function isInvalidTokenError(err) {
  if (err?.code === 'TokenInvalid') return true;
  const msg = typeof err?.message === 'string' ? err.message : '';
  return /invalid token/i.test(msg);
}
