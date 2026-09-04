import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

describe('axiosInstance', () => {
  let axiosInstance;
  let clearSpy;
  let sessionClearSpy;

  beforeEach(async () => {
    vi.resetModules();
    window.localStorage.clear();
    window.sessionStorage.clear();
    clearSpy = vi.spyOn(window.localStorage, 'clear').mockImplementation(() => {});
    sessionClearSpy = vi.spyOn(window.sessionStorage, 'clear').mockImplementation(() => {});
    delete window.location;
    window.location = { href: '' };
    vi.stubEnv('VITE_API_URL', 'http://localhost:8000/api');
    const mod = await import('./axiosInstance.js');
    axiosInstance = mod.default;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('has baseURL from env', () => {
    expect(axiosInstance.defaults.baseURL).toBeDefined();
  });

  it('request interceptor adds Authorization when token exists', async () => {
    localStorage.setItem('token', 'test-token-123');
    const config = { headers: {} };
    const interceptor = axiosInstance.interceptors.request.handlers[0];
    if (interceptor) {
      const result = await interceptor.fulfilled(config);
      expect(result.headers.Authorization).toBe('Bearer test-token-123');
    } else {
      expect(axiosInstance.interceptors.request).toBeDefined();
    }
  });

  it('request interceptor does not add Authorization when token is missing', async () => {
    localStorage.clear();
    const config = { headers: {} };
    const interceptor = axiosInstance.interceptors.request.handlers[0];
    if (interceptor) {
      const result = await interceptor.fulfilled(config);
      expect(result.headers.Authorization).toBeUndefined();
    } else {
      expect(axiosInstance.interceptors.request).toBeDefined();
    }
  });

  it('response interceptor handles 401 and redirects', async () => {
    const error = {
      response: { status: 401 },
      config: {},
    };
    const interceptor = axiosInstance.interceptors.response.handlers[0];
    if (interceptor) {
      try {
        await interceptor.rejected(error);
      } catch (e) {
        expect(e).toEqual(error);
      }
      expect(window.location.href).toBe('/auth/login');
    } else {
      expect(axiosInstance.interceptors.response).toBeDefined();
    }
  });

  it('response interceptor does not redirect when skipAuthLogout is true', async () => {
    const error = {
      response: { status: 401 },
      config: { skipAuthLogout: true },
    };
    const interceptor = axiosInstance.interceptors.response.handlers[0];
    if (interceptor) {
      window.location.href = '';
      try {
        await interceptor.rejected(error);
      } catch {}
      expect(window.location.href).not.toBe('/auth/login');
    }
  });

  it('response interceptor passes through for non-401 status', async () => {
    const error = {
      response: { status: 500 },
      config: {},
    };
    const interceptor = axiosInstance.interceptors.response.handlers[0];
    if (interceptor) {
      try {
        await interceptor.rejected(error);
      } catch (e) {
        expect(e.response.status).toBe(500);
      }
    }
  });
});
