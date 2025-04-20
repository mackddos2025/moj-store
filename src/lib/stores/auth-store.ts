import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from './supabase';

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'customer';
  telegram_id?: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, userData: Omit<User, 'id'>) => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user?.id)
          .single();

        set({ user: userData, token: data.session?.access_token || null });
      },
      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, token: null });
      },
      signup: async (email: string, password: string, userData: Omit<User, 'id'>) => {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;

        const { data: userData, error: userError } = await supabase
          .from('users')
          .insert([{ ...userData, id: authData.user?.id }])
          .select()
          .single();

        if (userError) throw userError;

        set({ user: userData, token: authData.session?.access_token || null });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);