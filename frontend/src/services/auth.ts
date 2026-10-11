
import api from './api';

const TOKEN_STORAGE_KEY = 'nexus-ai-access-token';

export type LocalAccount = {
  name: string;
  company: string;
  email: string;
  password: string;
};

type AuthResponse = {
  message: string;
  access_token: string;
  token_type: string;
  user: {
    id: number;
    email: string;
  };
};

type RegisterResponse = {
  message: string;
  user: {
    id: number;
    email: string;
  };
};

export function createLocalAccount(
  account: LocalAccount
): Promise<RegisterResponse> {
  return api.post<RegisterResponse>('/register', {
    email: account.email.trim(),
    password: account.password,
  });
}

export async function authenticateLocally(
  email: string,
  password: string
): Promise<boolean> {
  const response = await api.post<AuthResponse>('/login', {
    email: email.trim(),
    password,
  });

  sessionStorage.setItem(
    TOKEN_STORAGE_KEY,
    response.access_token
  );

  return true;
}

export function getAccessToken(): string | null {
  return sessionStorage.getItem(TOKEN_STORAGE_KEY);
}

export function isLocallyAuthenticated(): boolean {
  return Boolean(getAccessToken());
}

export function clearLocalSession(): void {
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
}