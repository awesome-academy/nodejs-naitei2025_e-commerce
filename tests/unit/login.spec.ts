import { jest, describe, it, expect, beforeAll } from '@jest/globals';
import type { AuthError, AuthResponse, Session, User } from '@supabase/supabase-js';

type SignInOptions = {
  email: string;
  password: string;
};

const mockSignIn = jest.fn() as jest.MockedFunction<
  (opts: SignInOptions) => Promise<AuthResponse>
>;

await jest.unstable_mockModule('../../src/services/supabaseClient', () => ({
  __esModule: true,
  default: {
    auth: {
      signInWithPassword: mockSignIn
    }
  }
}));

let loginWithSupabase: typeof import('../../src/services/authService').loginWithSupabase;

beforeAll(async () => {
  const module = await import('../../src/services/authService');
  loginWithSupabase = module.loginWithSupabase;
});

describe('loginWithSupabase', () => {
  const user: User = {
    id: 'user-1',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString()
  };

  const session: Session = {
    access_token: 'abc',
    expires_in: 3600,
    expires_at: 0,
    refresh_token: 'refresh',
    token_type: 'bearer',
    user
  };

  beforeEach(() => {
    mockSignIn.mockReset();
  });

  it('returns success when Supabase responds with a session', async () => {
    const successResponse: AuthResponse = {
      data: {
        user,
        session
      },
      error: null
    };
    mockSignIn.mockResolvedValue(successResponse);
    const result = await loginWithSupabase('test@example.com', 'secret');
    expect(result).toEqual({ success: true, session });
    expect(mockSignIn).toHaveBeenCalledWith({ email: 'test@example.com', password: 'secret' });
  });

  it('returns failure when Supabase returns an error', async () => {
    const error = new Error('bad credentials') as AuthError;
    const errorResponse: AuthResponse = {
      data: {
        user: null,
        session: null
      },
      error
    };
    mockSignIn.mockResolvedValue(errorResponse);
    const result = await loginWithSupabase('test', 'secret');
    expect(result.success).toBe(false);
    expect(result.error).toBe(error);
  });

  it('returns failure when no session is provided', async () => {
    const noSessionResponse: AuthResponse = {
      data: {
        user: null,
        session: null
      },
      error: null
    };
    mockSignIn.mockResolvedValue(noSessionResponse);
    const result = await loginWithSupabase('test', 'secret');
    expect(result.success).toBe(false);
    expect(result.session).toBeUndefined();
  });
});
