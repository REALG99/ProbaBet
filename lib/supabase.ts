import { createClient, type Session, type User } from '@supabase/supabase-js';

export type AuthUser = {
  id: string;
  email?: string;
  email_confirmed_at?: string | null;
};

type AuthSession = Session;

type AuthResponse = {
  data: {
    user: AuthUser | null;
    session: AuthSession | null;
  };
  error: { message: string } | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function normalizeUser(user: User | null | undefined): AuthUser | null {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    email_confirmed_at: user.email_confirmed_at ?? null,
  };
}

function missingConfigError() {
  return { message: 'Config Supabase mancante (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).' };
}

const client =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;

export const supabase = {
  auth: {
    async signInWithPassword({ email, password }: { email: string; password: string }): Promise<AuthResponse> {
      if (!client) return { data: { user: null, session: null }, error: missingConfigError() };

      const { data, error } = await client.auth.signInWithPassword({ email, password });
      return {
        data: { user: normalizeUser(data.user), session: data.session },
        error: error ? { message: error.message } : null,
      };
    },

    async signUp({ email, password, options }: { email: string; password: string; options?: { emailRedirectTo?: string } }): Promise<AuthResponse> {
      if (!client) return { data: { user: null, session: null }, error: missingConfigError() };

      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: options?.emailRedirectTo },
      });

      return {
        data: { user: normalizeUser(data.user), session: data.session },
        error: error ? { message: error.message } : null,
      };
    },

    async resetPasswordForEmail(email: string, options?: { redirectTo?: string }) {
      if (!client) return { data: null, error: missingConfigError() };

      const { data, error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: options?.redirectTo,
      });

      return {
        data,
        error: error ? { message: error.message } : null,
      };
    },

    async updatePassword(password: string) {
      if (!client) return { data: { user: null }, error: missingConfigError() };
      const { data, error } = await client.auth.updateUser({ password });
      return {
        data: { user: normalizeUser(data.user) },
        error: error ? { message: error.message } : null,
      };
    },

    async exchangeCodeForSession(code: string) {
      if (!client) return { data: { session: null, user: null }, error: missingConfigError() };
      const { data, error } = await client.auth.exchangeCodeForSession(code);
      return {
        data: { session: data.session, user: normalizeUser(data.user) },
        error: error ? { message: error.message } : null,
      };
    },

    onAuthStateChange(callback: (event: string) => void) {
      if (!client) return { data: { subscription: { unsubscribe: () => undefined } } };
      return client.auth.onAuthStateChange((event) => callback(event));
    },

    async signOut() {
      if (!client) return { error: null };
      const { error } = await client.auth.signOut();
      return { error: error ? { message: error.message } : null };
    },

    async getSession() {
      if (!client) return { data: { session: null }, error: missingConfigError() };
      const { data, error } = await client.auth.getSession();
      return {
        data: { session: data.session },
        error: error ? { message: error.message } : null,
      };
    },
  },
};
