import { describe, it, expect, beforeEach } from 'vitest';
import {
  formatRoleName,
  isTokenValid,
  getToken,
  setToken,
  clearTokens,
} from '../../src/utils/user';

const makeJwt = (payload: Record<string, unknown>): string => {
  const b64 = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(payload)}.signature`;
};

beforeEach(() => {
  localStorage.clear();
});

describe('formatRoleName', () => {
  it('formats "chef" correctly', () => {
    expect(formatRoleName('chef')).toBe('Chef');
  });

  it('formats "sous-chef" correctly', () => {
    expect(formatRoleName('sous-chef')).toBe('Sous-Chef');
  });

  it('formats "membre" correctly', () => {
    expect(formatRoleName('membre')).toBe('Membre');
  });

  it('returns "Inconnu" for an unknown role', () => {
    expect(formatRoleName('admin')).toBe('Inconnu');
    expect(formatRoleName('')).toBe('Inconnu');
  });
});

describe('isTokenValid', () => {
  it('returns false for null input', () => {
    expect(isTokenValid(null)).toBe(false);
  });

  it('returns false for a malformed token', () => {
    expect(isTokenValid('not.a.token')).toBe(false);
  });

  it('returns false for an expired token', () => {
    const token = makeJwt({ exp: Math.floor(Date.now() / 1000) - 3600 });
    expect(isTokenValid(token)).toBe(false);
  });

  it('returns true for a valid non-expired token', () => {
    const token = makeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
    expect(isTokenValid(token)).toBe(true);
  });

  it('returns true for a token without expiry', () => {
    const token = makeJwt({ id: '123' });
    expect(isTokenValid(token)).toBe(true);
  });
});

describe('getToken / setToken / clearTokens', () => {
  it('returns null when no token is stored', () => {
    expect(getToken()).toBeNull();
  });

  it('stores and retrieves a token', () => {
    setToken('my-token');
    expect(getToken()).toBe('my-token');
  });

  it('clears all tokens from localStorage', () => {
    setToken('my-token');
    localStorage.setItem('refreshToken', 'my-refresh');
    clearTokens();
    expect(getToken()).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });

  it('also clears legacy token keys', () => {
    localStorage.setItem('adminToken', 'old-admin');
    localStorage.setItem('token', 'old-token');
    clearTokens();
    expect(localStorage.getItem('adminToken')).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });
});
