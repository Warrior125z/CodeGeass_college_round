const ACCOUNT_STORAGE_KEY = 'nexus-ai-local-account';
const SESSION_STORAGE_KEY = 'nexus-ai-local-session';

export type LocalAccount = {
  name: string;
  company: string;
  email: string;
  password: string;
};

function readAccount(): LocalAccount | null {
  const storedAccount = localStorage.getItem(ACCOUNT_STORAGE_KEY);

  if (!storedAccount) {
    return null;
  }

  try {
    return JSON.parse(storedAccount) as LocalAccount;
  } catch {
    localStorage.removeItem(ACCOUNT_STORAGE_KEY);
    return null;
  }
}

export function createLocalAccount(account: LocalAccount): void {
  localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(account));
  localStorage.setItem(SESSION_STORAGE_KEY, account.email);
}

export function authenticateLocally(
  email: string,
  password: string
): boolean {
  const account = readAccount();

  if (!account || account.email.toLowerCase() !== email.trim().toLowerCase()) {
    return false;
  }

  if (account.password !== password) {
    return false;
  }

  localStorage.setItem(SESSION_STORAGE_KEY, account.email);
  return true;
}

export function isLocallyAuthenticated(): boolean {
  const sessionEmail = localStorage.getItem(SESSION_STORAGE_KEY);
  const account = readAccount();

  return Boolean(
    sessionEmail &&
      account &&
      account.email.toLowerCase() === sessionEmail.toLowerCase()
  );
}

export function clearLocalSession(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}
