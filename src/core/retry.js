const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function isRetryable(err) {
  if (err.status === 429) return true;
  if (err.code === 'ECONNRESET') return true;
  if (err.code === 'ETIMEDOUT') return true;
  if (err.code === 'ENOTFOUND') return true;
  return false;
}

export async function withRetry(fn, options = {}) {
  const { maxAttempts = 3, baseDelay = 1000, maxDelay = 10000, onRetry = null } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      if (attempt === maxAttempts) throw err;
      if (!isRetryable(err)) throw err;

      const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);

      if (onRetry) {
        onRetry({ attempt, maxAttempts, delay, error: err });
      }

      await sleep(delay);
    }
  }

  throw lastError;
}

export async function withTimeout(fn, timeoutMs, timeoutMessage = 'Operation timed out') {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fn(controller.signal);
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(timeoutMessage);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
