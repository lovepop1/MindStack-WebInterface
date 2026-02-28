import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a dummy client during static build — it won't be called at runtime
    // as all pages are 'force-dynamic' (client components run only in browser)
    _supabase = createClient(
      'https://placeholder.supabase.co',
      'placeholder-key'
    );
    return _supabase;
  }

  _supabase = createClient(supabaseUrl, supabaseAnonKey);
  return _supabase;
}

// Export a proxy so callers can use `supabase.auth.xxx` naturally
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop: string | symbol) {
    return Reflect.get(getSupabase(), prop);
  },
});

export async function getJWT(): Promise<string | null> {
  const { data } = await getSupabase().auth.getSession();
  return data.session?.access_token ?? null;
}

export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const jwt = await getJWT();

  if (!jwt) {
    throw new ApiError(401, 'No session');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      Authorization: `Bearer ${jwt}`,
    },
  });

  if (response.status === 401) {
    await getSupabase().auth.signOut();
    throw new ApiError(401, 'Unauthorized');
  }

  return response;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
