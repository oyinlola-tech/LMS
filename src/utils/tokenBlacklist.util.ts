interface BlacklistEntry {
  jti: string;
  expiresAt: number;
}

const blacklist = new Map<string, BlacklistEntry>();

const CLEANUP_INTERVAL_MS = 60_000;

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function startCleanup(): void {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of blacklist) {
      if (entry.expiresAt <= now) blacklist.delete(key);
    }
  }, CLEANUP_INTERVAL_MS);
  if (cleanupTimer && typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
    (cleanupTimer as any).unref();
  }
}

export function addToBlacklist(token: string, exp: number): void {
  const jti = token;
  blacklist.set(jti, { jti, expiresAt: exp * 1000 });
  startCleanup();
}

export function isBlacklisted(token: string): boolean {
  const entry = blacklist.get(token);
  if (!entry) return false;
  if (entry.expiresAt <= Date.now()) {
    blacklist.delete(token);
    return false;
  }
  return true;
}

export function clearBlacklist(): void {
  blacklist.clear();
}
