import { apiFetch, setAuthToken } from './apiClient';

export interface LoginResult {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    phone?: string;
  };
  error?: Error;
}

export const loginWithApi = async (email: string, password: string): Promise<LoginResult> => {
  try {
    const payload = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setAuthToken(payload?.token);
    return { success: true, token: payload?.token, user: payload?.user };
  } catch (error) {
    return { success: false, error: error as Error };
  }
};
