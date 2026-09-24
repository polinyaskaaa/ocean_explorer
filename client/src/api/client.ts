const API_BASE = '/api';

export const TOKEN_STORAGE_KEY = 'doe.token';

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
  }
}

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  auth?: boolean;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const token = auth ? readToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'Не вдалося звʼязатися з сервером. Перевірте, чи він запущений.');
  }

  if (response.status === 204) return undefined as T;

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = (payload as { message?: string } | null)?.message ?? 'Сталася помилка';
    const details = (payload as { details?: Record<string, string[]> } | null)?.details;
    throw new ApiError(response.status, message, details);
  }

  return payload as T;
}
