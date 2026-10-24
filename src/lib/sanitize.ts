/**
 * Input sanitization + validation for all user-supplied API payloads.
 * Keep this strict: better to reject a valid edge case than to accept a
 * malformed one.
 */

const MAX_TEXT = 500;
const MAX_LIST = 50;

/** Trim + collapse whitespace + hard-length cap. Rejects control chars. */
export function cleanText(v: unknown, max = MAX_TEXT): string {
  if (typeof v !== "string") return "";
  return v
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

/** Accept only an array of trimmed strings, capped in length and per-item size. */
export function cleanStringList(v: unknown, maxItems = MAX_LIST): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === "string")
    .map((x) => cleanText(x, 100))
    .filter(Boolean)
    .slice(0, maxItems);
}

/** Boolean that only accepts real booleans. */
export function cleanBool(v: unknown): boolean {
  return v === true;
}

/**
 * Basic URL validation. Allows http/https only, and only if the host does
 * not contain @ (which would let attackers smuggle credentials or other
 * protocol tricks in via the userinfo part).
 */
export function cleanUrl(v: unknown, max = 500): string {
  const s = cleanText(v, max);
  if (!s) return "";
  try {
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:") return "";
    if (u.hostname.includes("@")) return "";
    return s;
  } catch {
    return "";
  }
}

/**
 * Parse a body that may or may not be JSON. Returns null on parse failure
 * instead of throwing so callers can return 400.
 */
export async function safeJson(request: Request): Promise<any | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export interface ValidationError {
  field: string;
  message: string;
}

/** Collects validation errors as we go, so we can report all issues at once. */
export class Validator {
  errors: ValidationError[] = [];
  failed = false;

  require(cond: boolean, field: string, message: string) {
    if (cond) return;
    this.errors.push({ field, message });
    this.failed = true;
  }

  check() {
    return { ok: !this.failed, errors: this.errors };
  }
}
