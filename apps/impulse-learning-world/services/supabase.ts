/**
 * Lightweight Supabase REST client wrapper ready for immediate activation.
 * Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env
 * to switch the repository from local mock mode to live Supabase Postgres.
 */
export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) return null;
  return { url: url.replace(/\/$/, ''), anonKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig() !== null;
}

export async function supabaseRest<T>(
  table: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH';
    query?: string;
    body?: unknown;
    accessToken?: string;
    prefer?: string;
  } = {}
): Promise<T> {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error('Supabase is not configured. Using local mock persistence.');
  }

  const endpoint = `${config.url}/rest/v1/${table}${options.query ? `?${options.query}` : ''}`;
  const res = await fetch(endpoint, {
    method: options.method ?? 'GET',
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${options.accessToken ?? config.anonKey}`,
      'Content-Type': 'application/json',
      ...(options.prefer ? { Prefer: options.prefer } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    throw new Error(`Supabase REST error (${res.status}): ${await res.text()}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}
