import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { AuthAPI } from '../api/endpoints';

// Mock AuthAPI module functions
jest.mock('../api/endpoints', () => ({
  AuthAPI: {
    me: jest.fn(),
    login: jest.fn(),
    signup: jest.fn(),
    logout: jest.fn(),
  }
}));

function wrapper({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('AuthContext', () => {
  const realLocalStorage = global.localStorage;

  beforeEach(() => {
    // fresh mocks before each test
    jest.clearAllMocks();

    // Provide a simple mock for localStorage to observe interactions
    let store = {};
    const mockLocalStorage = {
      getItem: jest.fn((key) => store[key] ?? null),
      setItem: jest.fn((key, val) => {
        store[key] = String(val);
      }),
      removeItem: jest.fn((key) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        store = {};
      }),
    };
    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      configurable: true,
      writable: true,
    });
  });

  afterAll(() => {
    // restore original localStorage
    Object.defineProperty(global, 'localStorage', {
      value: realLocalStorage,
      configurable: true,
      writable: true,
    });
  });

  test('initializes with no token -> loading becomes false and user/token remain null', async () => {
    // No token in localStorage
    localStorage.getItem.mockReturnValueOnce(null);

    const { result } = renderHook(() => useAuth(), { wrapper });

    // initial loading state true, then becomes false
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(AuthAPI.me).not.toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  test('initializes with token -> calls me, sets user/token on success', async () => {
    const token = 'abc123';
    const fakeUser = { id: 'u1', email: 'x@y.z' };

    localStorage.getItem.mockReturnValueOnce(token);
    AuthAPI.me.mockResolvedValueOnce(fakeUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    // loading starts true, then finishes
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(AuthAPI.me).toHaveBeenCalledWith(token);
      expect(result.current.loading).toBe(false);
      expect(result.current.user).toEqual(fakeUser);
      expect(result.current.token).toBe(token);
    });
  });

  test('initializes with token -> me fails -> token removed, stays logged out', async () => {
    const token = 'badtoken';
    localStorage.getItem.mockReturnValueOnce(token);
    AuthAPI.me.mockRejectedValueOnce(new Error('unauthorized'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(AuthAPI.me).toHaveBeenCalledWith(token);
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(result.current.loading).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
    });
  });

  test('login sets user/token and persists token', async () => {
    const token = 't-login';
    const user = { id: 'u2', email: 'test@login.com' };
    AuthAPI.login.mockResolvedValueOnce({ token, user });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@login.com', 'password');
    });

    expect(AuthAPI.login).toHaveBeenCalledWith('test@login.com', 'password');
    expect(result.current.user).toEqual(user);
    expect(result.current.token).toBe(token);
    expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', token);
  });

  test('signup sets user/token and persists token', async () => {
    const token = 't-signup';
    const user = { id: 'u3', email: 'new@signup.com', displayName: 'Newbie' };
    AuthAPI.signup.mockResolvedValueOnce({ token, user });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signup('new@signup.com', 'pw', 'Newbie');
    });

    expect(AuthAPI.signup).toHaveBeenCalledWith('new@signup.com', 'pw', 'Newbie');
    expect(result.current.user).toEqual(user);
    expect(result.current.token).toBe(token);
    expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', token);
  });

  test('logout clears user/token, removes token from storage, and calls API if token existed', async () => {
    // mock initial token via login flow to ensure token exists
    const token = 't-logout';
    const user = { id: 'u4', email: 'logout@test.com' };
    AuthAPI.login.mockResolvedValueOnce({ token, user });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('logout@test.com', 'pw');
    });

    // Confirm logged in
    expect(result.current.token).toBe(token);

    AuthAPI.logout.mockResolvedValueOnce({ ok: true });

    await act(async () => {
      await result.current.logout();
    });

    expect(AuthAPI.logout).toHaveBeenCalledWith(token);
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
  });

  test('logout still clears local state and storage even if API logout fails', async () => {
    const token = 't-logout-fail';
    const user = { id: 'u5', email: 'fail@test.com' };
    AuthAPI.login.mockResolvedValueOnce({ token, user });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('fail@test.com', 'pw');
    });

    AuthAPI.logout.mockRejectedValueOnce(new Error('network'));

    await act(async () => {
      await result.current.logout();
    });

    // Even on failure, we clear local state
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
  });
});
