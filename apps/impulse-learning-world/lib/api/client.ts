import { AppConfig } from '../config';
import { StorageKeys, storage } from '../storage';
import type { SignedIn } from './types';

export class ApiError extends Error {
  status: number;
  code?: string;
  body?: unknown;
  offline: boolean;

  constructor(message: string, status: number, code?: string, body?: unknown, offline = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.body = body;
    this.offline = offline;
  }
}

let accessToken: string | null = null;
let accessExpiresAt = 0;
let refreshInFlight: Promise<'ok' | 'unauthorized' | 'offline'> | null = null;
let onUnauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(fn: (() => void) | null) {
  onUnauthorizedHandler = fn;
}

export function setAccessToken(token: string | null, expiresInSec = 900) {
  accessToken = token;
  accessExpiresAt = token ? Date.now() + Math.max(30, expiresInSec - 30) * 1000 : 0;
}

export function getAccessToken(): string | null {
  return accessToken;
}

function makeUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function assetUrl(pathOrUrl: string | null | undefined): string | null {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  if (pathOrUrl.startsWith('/api/')) {
    return `${AppConfig.apiOrigin}${pathOrUrl}`;
  }
  const slash = pathOrUrl.startsWith('/') ? '' : '/';
  return `${AppConfig.apiBase}${slash}${pathOrUrl}`;
}

async function performRefresh(): Promise<'ok' | 'unauthorized' | 'offline'> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const key = StorageKeys.refreshToken(AppConfig.centerSlug);
    const storedRefresh = await storage.secure.get(key);
    if (!storedRefresh) return 'unauthorized';

    try {
      const res = await fetch(`${AppConfig.apiBase}/auth/refresh`, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'x-erp-tenant': AppConfig.centerSlug,
          'x-erp-client': AppConfig.clientHeader,
        },
        body: JSON.stringify({ refreshToken: storedRefresh }),
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          await storage.secure.remove(key);
          setAccessToken(null);
          onUnauthorizedHandler?.();
          return 'unauthorized';
        }
        return 'offline';
      }

      const data = (await res.json()) as SignedIn;
      setAccessToken(data.accessToken, data.expiresIn || 900);
      if (data.refreshToken) {
        await storage.secure.set(key, data.refreshToken);
      }
      return 'ok';
    } catch {
      return 'offline';
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  auth?: boolean;
  center?: string;
}

export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const method = opts.method ?? 'GET';
  const needsAuth = opts.auth !== false;
  const center = opts.center ?? AppConfig.centerSlug;

  if (needsAuth && (!accessToken || Date.now() >= accessExpiresAt)) {
    await performRefresh();
  }

  let url = `${AppConfig.apiBase}${path.startsWith('/') ? path : `/${path}`}`;
  if (opts.query) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(opts.query)) {
      if (v !== undefined && v !== null && v !== '') {
        qs.set(k, String(v));
      }
    }
    const queryStr = qs.toString();
    if (queryStr) url += `?${queryStr}`;
  }

  const isFormData = typeof FormData !== 'undefined' && opts.body instanceof FormData;
  const idempotencyKey =
    method !== 'GET' && !path.startsWith('/auth/') ? makeUuid() : undefined;

  const buildHeaders = (): Record<string, string> => {
    const h: Record<string, string> = {
      accept: 'application/json',
      'x-erp-tenant': center,
      'x-erp-client': AppConfig.clientHeader,
    };
    if (!isFormData && opts.body !== undefined) {
      h['content-type'] = 'application/json';
    }
    if (needsAuth && accessToken) {
      h.authorization = `Bearer ${accessToken}`;
    }
    if (idempotencyKey) {
      h['idempotency-key'] = idempotencyKey;
    }
    return h;
  };

  const execute = async () => {
    try {
      return await fetch(url, {
        method,
        headers: buildHeaders(),
        body:
          opts.body === undefined
            ? undefined
            : isFormData
              ? (opts.body as FormData)
              : JSON.stringify(opts.body),
      });
    } catch {
      throw new ApiError('Could not reach Impulse server. Check your internet connection.', 0, 'OFFLINE', undefined, true);
    }
  };

  let res = await execute();

  // Single retry after refresh on 401
  if (res.status === 401 && needsAuth) {
    const refreshed = await performRefresh();
    if (refreshed === 'ok') {
      res = await execute();
    }
  }

  const rawText = await res.text();
  let parsed: unknown = null;
  try {
    parsed = rawText ? JSON.parse(rawText) : null;
  } catch {
    parsed = rawText;
  }

  if (!res.ok) {
    const msg =
      (parsed && typeof parsed === 'object' && 'message' in parsed
        ? Array.isArray((parsed as { message: unknown }).message)
          ? String((parsed as { message: unknown[] }).message[0])
          : String((parsed as { message: unknown }).message)
        : null) || `Request failed (${res.status})`;
    const code =
      parsed && typeof parsed === 'object' && 'code' in parsed
        ? String((parsed as { code: unknown }).code)
        : undefined;
    throw new ApiError(msg, res.status, code, parsed);
  }

  return parsed as T;
}

export async function restoreSessionToken(): Promise<'ok' | 'unauthorized' | 'offline'> {
  return performRefresh();
}
