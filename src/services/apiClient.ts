const resolveApiBaseUrl = () =>
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthToken = () => localStorage.getItem('auth_token');

const setAuthToken = (token?: string | null) => {
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

const apiFetch = async (path: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined)
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${resolveApiBaseUrl()}${path}`, {
    ...options,
    headers
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.success === false) {
    const message = payload?.error || payload?.message || 'API request failed';
    throw new Error(message);
  }

  return payload;
};

export { resolveApiBaseUrl, apiFetch, getAuthToken, setAuthToken };
