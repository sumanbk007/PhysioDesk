const StorageKeys = {
  ACCESS_TOKEN: "physiodesk_access_token",
} as const;

type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];

const isBrowser = (): boolean => typeof window !== "undefined";

function getItem(key: StorageKey): string | null {
  if (!isBrowser()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setItem(key: StorageKey, value: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* quota exceeded, private mode, etc. */
  }
}

function removeItem(key: StorageKey): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export const storage = {
  getAccessToken: () => getItem(StorageKeys.ACCESS_TOKEN),
  setAccessToken: (token: string) => setItem(StorageKeys.ACCESS_TOKEN, token),
  removeAccessToken: () => removeItem(StorageKeys.ACCESS_TOKEN),
  clearAuth: () => removeItem(StorageKeys.ACCESS_TOKEN),
};

export { StorageKeys };
export type { StorageKey };
