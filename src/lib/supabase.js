import { createClient } from '@supabase/supabase-js';

// تكوين Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// إنشاء عميل Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// وظائف مساعدة للتعامل مع قاعدة البيانات

// جلب المنتجات من قاعدة البيانات
export async function fetchProductsFromDB() {
  try {
    // إذا كانت بيانات Supabase متوفرة، استخدمها
    if (supabaseUrl && supabaseAnonKey) {
      const { data, error } = await supabase
        .from('products')
        .select('*');
      
      if (error) throw error;
      return data || [];
    } else {
      // استخدام Fake Store API كبديل
      const response = await fetch('https://fakestoreapi.com/products');
      if (!response.ok) throw new Error('فشل في جلب البيانات');
      return await response.json();
    }
  } catch (error) {
    console.error('خطأ في جلب المنتجات:', error);
    // استخدام Fake Store API كبديل في حالة الخطأ
    const response = await fetch('https://fakestoreapi.com/products');
    return await response.json();
  }
}

// جلب تفاصيل منتج محدد
export async function fetchProductById(id) {
  try {
    // إذا كانت بيانات Supabase متوفرة، استخدمها
    if (supabaseUrl && supabaseAnonKey) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } else {
      // استخدام Fake Store API كبديل
      const response = await fetch(`https://fakestoreapi.com/products/${id}`);
      if (!response.ok) throw new Error('فشل في جلب البيانات');
      return await response.json();
    }
  } catch (error) {
    console.error(`خطأ في جلب المنتج رقم ${id}:`, error);
    // استخدام Fake Store API كبديل في حالة الخطأ
    const response = await fetch(`https://fakestoreapi.com/products/${id}`);
    return await response.json();
  }
}

// جلب فئات المنتجات
export async function fetchCategories() {
  try {
    // إذا كانت بيانات Supabase متوفرة، استخدمها
    if (supabaseUrl && supabaseAnonKey) {
      const { data, error } = await supabase
        .from('categories')
        .select('*');
      
      if (error) throw error;
      return data?.map(cat => cat.name) || [];
    } else {
      // استخدام Fake Store API كبديل
      const response = await fetch('https://fakestoreapi.com/products/categories');
      if (!response.ok) throw new Error('فشل في جلب البيانات');
      return await response.json();
    }
  } catch (error) {
    console.error('خطأ في جلب الفئات:', error);
    // استخدام Fake Store API كبديل في حالة الخطأ
    const response = await fetch('https://fakestoreapi.com/products/categories');
    return await response.json();
  }
}