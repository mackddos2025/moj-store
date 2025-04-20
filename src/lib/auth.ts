import { supabase } from './supabase';

export async function checkUserRole(): Promise<'admin' | 'user' | null> {
  try {
    // التحقق من تسجيل الدخول
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Auth User:', user);
    
    if (!user) {
      console.log('No authenticated user found');
      return null;
    }

    // جلب دور المستخدم
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }

    console.log('User role from database:', data?.role);
    return data?.role || 'user';
  } catch (error) {
    console.error('Error checking user role:', error);
    return null;
  }
}

export async function isAdmin(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }

    console.log('Admin check result:', data?.role === 'admin');
    return data?.role === 'admin';
  } catch (error) {
    console.error('Error in isAdmin:', error);
    return false;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Authentication check:', !!user);
    return !!user;
  } catch (error) {
    console.error('Error in isAuthenticated:', error);
    return false;
  }
} 