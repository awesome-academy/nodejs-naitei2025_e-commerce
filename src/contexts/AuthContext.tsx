import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback
} from 'react';
import { apiFetch, getAuthToken, setAuthToken } from '../services/apiClient';
import { loginWithApi } from '../services/authService';

type UserRole = 'customer' | 'admin' | 'editor' | 'viewer';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
}

export interface ProfileRow {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  avatar?: string;
  phone?: string;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  token: string | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const defaultAddresses = [
  {
    id: 1,
    name: 'Địa chỉ nhà',
    fullName: 'Khách hàng',
    phone: '0901234567',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    isDefault: true
  }
];

const defaultPaymentMethods = [
  {
    id: 1,
    type: 'cod',
    name: 'Thanh toán khi nhận hàng',
    details: 'Tiền mặt',
    isDefault: true
  }
];

const defaultNotifications = [
  {
    id: 1,
    title: 'Chào mừng bạn đến với cửa hàng!',
    message: 'Bắt đầu mua sắm và nhận ưu đãi độc quyền cho thành viên mới.',
    time: 'Vừa xong',
    read: false
  }
];

const AUTH_USER_KEY = 'auth_user';

const getStoredUser = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
};

const setStoredUser = (profile: UserProfile | null) => {
  if (!profile) {
    localStorage.removeItem(AUTH_USER_KEY);
    return;
  }
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(profile));
};

export const normalizeRole = (value?: string): UserRole => {
  switch ((value || '').toLowerCase()) {
    case 'admin':
      return 'admin';
    case 'editor':
      return 'editor';
    case 'viewer':
      return 'viewer';
    default:
      return 'customer';
  }
};

export const deriveRoleFromEmail = (email?: string | null): UserRole => {
  if (!email) return 'customer';
  const normalized = email.toLowerCase();
  if (normalized.startsWith('admin@')) return 'admin';
  if (normalized.startsWith('editor@')) return 'editor';
  if (normalized.startsWith('viewer@')) return 'viewer';
  return 'customer';
};

export const mapUserFromProfile = (profile?: ProfileRow): UserProfile => {
  const email = profile?.email || '';
  const resolvedRole = profile?.role ? normalizeRole(profile.role) : deriveRoleFromEmail(email);
  return {
    id: profile?.id || '',
    name: profile?.name || profile?.email || 'User',
    email,
    role: resolvedRole,
    avatar: profile?.avatar,
    phone: profile?.phone
  };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const existingToken = getAuthToken();
      if (!existingToken) {
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      const cachedUser = getStoredUser();
      if (cachedUser) {
        setUser(cachedUser);
        setToken(existingToken);
      }

      try {
        const payload = await apiFetch('/auth/me');
        if (!isMounted) return;
        const mappedUser = mapUserFromProfile(payload?.user);
        setUser(mappedUser);
        setStoredUser(mappedUser);
        setToken(existingToken);
      } catch (error) {
        console.error('hydrateUser error', error);
        if (!cachedUser) {
          setUser(null);
          setToken(null);
        }
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const { success, token: accessToken, user: loggedInUser } = await loginWithApi(email, password);
      if (!success || !accessToken) {
        return false;
      }
      setAuthToken(accessToken);
      const mappedUser = mapUserFromProfile(loggedInUser);
      setUser(mappedUser);
      setStoredUser(mappedUser);
      setToken(accessToken);
      return true;
    } catch (err) {
      console.error('login error', err);
      return false;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      setUser(null);
      setToken(null);
      setAuthToken(null);
      setStoredUser(null);
    } catch (error) {
      console.error('logout error', error);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, phone?: string): Promise<boolean> => {
    try {
      const payload = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, phone })
      });

      const tokenValue = payload?.token;
      const userProfile = payload?.user as ProfileRow | undefined;
      if (!tokenValue || !userProfile) return false;

      setAuthToken(tokenValue);
      const mappedUser = mapUserFromProfile(userProfile);
      setUser(mappedUser);
      setStoredUser(mappedUser);
      setToken(tokenValue);

      await apiFetch(`/profiles/${userProfile.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          addresses: defaultAddresses,
          payment_methods: defaultPaymentMethods,
          notifications: defaultNotifications,
          loyalty_points: 1200,
          tier: 'VIP'
        })
      });
      return true;
    } catch (err) {
      console.error('register error', err);
      return false;
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    token,
    loading,
    login,
    logout,
    register
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
