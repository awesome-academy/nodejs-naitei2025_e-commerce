import { normalizeRole, deriveRoleFromEmail, mapUserFromProfile, ProfileRow } from '../../src/contexts/AuthContext';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';

const fallbackUser: SupabaseAuthUser = {
  id: 'user-123',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'fallback@example.com',
  phone: undefined,
  app_metadata: {},
  user_metadata: { name: 'Fallback Name' },
  created_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString()
};

describe('Auth helpers', () => {
  it('normalizes admin roles', () => {
    expect(normalizeRole('Admin')).toBe('admin');
  });

  it('normalizes editor roles', () => {
    expect(normalizeRole('editor')).toBe('editor');
  });

  it('normalizes viewer roles', () => {
    expect(normalizeRole('VIEWER')).toBe('viewer');
  });

  it('defaults unknown roles to customer', () => {
    expect(normalizeRole('owner')).toBe('customer');
  });

  it('derives role from admin email prefix', () => {
    expect(deriveRoleFromEmail('admin@site.com')).toBe('admin');
  });

  it('derives role from editor email prefix', () => {
    expect(deriveRoleFromEmail('editor@site.com')).toBe('editor');
  });

  it('derives role from viewer email prefix', () => {
    expect(deriveRoleFromEmail('viewer@site.com')).toBe('viewer');
  });

  it('falls back to customer for other emails', () => {
    expect(deriveRoleFromEmail('customer@site.com')).toBe('customer');
  });

  it('maps profile data over fallback user info', () => {
    const profile: ProfileRow = {
      id: 'profile-1',
      email: 'profile@example.com',
      name: 'Profile User',
      role: 'admin',
      phone: '0902000111'
    };

    const mapped = mapUserFromProfile(profile, fallbackUser);
    expect(mapped.id).toBe('profile-1');
    expect(mapped.name).toBe('Profile User');
    expect(mapped.role).toBe('admin');
  });

  it('uses fallback auth user when profile is missing', () => {
    const mapped = mapUserFromProfile(undefined, fallbackUser);
    expect(mapped.id).toBe('user-123');
    expect(mapped.name).toBe('Fallback Name');
    expect(mapped.role).toBe('customer');
  });
});
