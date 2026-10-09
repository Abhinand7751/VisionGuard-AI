const authTokenKey = "visionguard_access_token";

export function getStoredToken(): string | null {
  return window.localStorage.getItem(authTokenKey);
}

export function storeToken(token: string): void {
  window.localStorage.setItem(authTokenKey, token);
}

export function clearStoredToken(): void {
  window.localStorage.removeItem(authTokenKey);
}
