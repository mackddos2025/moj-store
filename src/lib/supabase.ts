import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// أنواع البيانات
export type Category = {
  id: string;
  name: string;
  image: string;
  created_at: string;
};

export type Subcategory = {
  id: string;
  name: string;
  category_id: string;
  image: string;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  subcategory_id: string;
  category_id: string;
  image: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export type Discount = {
  id: string;
  product_id: string;
  min_quantity: number;
  discount_percentage: number;
  created_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'shipping' | 'delivered' | 'cancelled';
  created_at: string;
  expected_delivery_time?: string;
  total: number;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'customer';
  telegram_id?: string;
  created_at: string;
};

// Helper function to handle Supabase errors
const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  throw new Error(error.message || 'حدث خطأ في الاتصال بقاعدة البيانات');
};

export const getCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*');
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error);
  }
};

export const createCategory = async (category: Omit<Category, 'id' | 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error);
  }
};

export const getSubcategories = async () => {
  try {
    const { data, error } = await supabase
      .from('subcategories')
      .select('*');
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error);
  }
};

export const createSubcategory = async (subcategory: Omit<Subcategory, 'id' | 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('subcategories')
      .insert([subcategory])
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error);
  }
};

export const getProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*');
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error);
  }
};

export const createProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error);
  }
};

export const getOrders = async () => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*');
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error);
  }
};

export const createOrder = async (order: Omit<Order, 'id' | 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error);
  }
};

export const getUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error);
  }
};

export const createUser = async (user: Omit<User, 'id' | 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error);
  }
};

type CreateUserData = Omit<User, "created_at">;

export const signUp = async (email: string, password: string, userData: Omit<User, "id" | "created_at">) => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    if (authData.user) {
      const { data: createdUser, error: userError } = await createUser({
        ...userData,
        email,
      });

      if (userError) throw userError;
      return createdUser;
    }
  } catch (error) {
    handleSupabaseError(error);
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error);
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error);
  }
}; 