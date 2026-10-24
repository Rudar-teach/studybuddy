/**
 * Production-safe logger. Only writes to stdout when NODE_ENV === 'development'.
 * In production, this is a no-op so that sensitive runtime data is not
 * leaked to logs.
 */
export const logError = (msg: string, err: unknown) => {
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.error(msg, err instanceof Error ? err.message : err);
  }
};

export const logWarn = (msg: string) => {
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.warn(msg);
  }
};
