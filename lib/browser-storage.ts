function getLocalStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function safeLocalStorageGet(key: string) {
  try {
    return getLocalStorage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function safeLocalStorageSet(key: string, value: string) {
  try {
    getLocalStorage()?.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function safeLocalStorageRemove(key: string) {
  try {
    getLocalStorage()?.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
