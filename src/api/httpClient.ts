/**
 * Resilient HTTP client with configurable timeout, retry logic, and exponential backoff.
 */

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  maxRetries?: number;
  backoffMs?: number;
}

const DEFAULT_TIMEOUT_MS = 5000; // 5 seconds per attempt
const DEFAULT_MAX_RETRIES = 2; // 1 initial attempt + 2 retries = 3 attempts total
const DEFAULT_BACKOFF_MS = 1000; // 1 second backoff between attempts

export class HttpConnectionError extends Error {
  attempts: number;

  constructor(message: string, attempts: number) {
    super(message);
    this.name = "HttpConnectionError";
    this.attempts = attempts;
  }
}

/**
 * Execute a fetch request with an automatic timeout and retry limit.
 * Will desist and throw HttpConnectionError once maxRetries is reached.
 */
export const fetchWithRetry = async (
  url: string,
  options: RequestOptions = {}
): Promise<Response> => {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    maxRetries = DEFAULT_MAX_RETRIES,
    backoffMs = DEFAULT_BACKOFF_MS,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;
  const totalAttempts = maxRetries + 1;

  for (let attempt = 1; attempt <= totalAttempts; attempt++) {
    const controller = new AbortController();
    let isTimeout = false;

    const timer = setTimeout(() => {
      isTimeout = true;
      controller.abort();
    }, timeoutMs);

    try {
      if (__DEV__) {
        console.log(`[HTTP] Attempt ${attempt}/${totalAttempts} -> ${fetchOptions.method || "GET"} ${url}`);
      }

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timer);

      // Server errors (5xx) are eligible for retry if attempts remain
      if (response.status >= 500 && attempt < totalAttempts) {
        lastError = new Error(`Server returned status ${response.status}`);
        await delay(backoffMs * attempt);
        continue;
      }

      // Return response immediately for 2xx, 3xx, and 4xx (client errors shouldn't retry)
      return response;
    } catch (err: unknown) {
      clearTimeout(timer);

      if (isTimeout) {
        lastError = new Error(`Connection timed out after ${timeoutMs / 1000}s`);
      } else if (err instanceof Error) {
        lastError = err;
      } else {
        lastError = new Error("Network request failed");
      }

      if (__DEV__) {
        console.warn(`[HTTP] Attempt ${attempt}/${totalAttempts} failed: ${lastError.message}`);
      }

      // If attempts remain, wait before next attempt
      if (attempt < totalAttempts) {
        await delay(backoffMs * attempt);
      }
    }
  }

  // All retries exhausted, desist and throw clean error
  const reason = lastError?.message || "Host unreachable";
  throw new HttpConnectionError(
    `Could not connect to server after ${totalAttempts} attempts (${reason}). Please check your connection and server URL.`,
    totalAttempts
  );
};

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
