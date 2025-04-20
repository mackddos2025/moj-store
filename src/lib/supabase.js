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
    // استخدام Fake Store API كبديل
    const response = await fetch('https://fakestoreapi.com/products');
    if (!response.ok) throw new Error('فشل في جلب البيانات');
    return await response.json();
  } catch (error) {
    console.error('خطأ في جلب المنتجات:', error);
    // إرجاع مصفوفة فارغة في حالة الخطأ
    return [];
  }
}

// جلب تفاصيل منتج محدد
export async function fetchProductById(id) {
  try {
    // استخدام Fake Store API كبديل
    const response = await fetch(`https://fakestoreapi.com/products/${id}`);
    if (!response.ok) throw new Error('فشل في جلب البيانات');
    return await response.json();
  } catch (error) {
    console.error(`خطأ في جلب المنتج رقم ${id}:`, error);
    // إرجاع كائن فارغ في حالة الخطأ
    return {};
  }
}

// جلب فئات المنتجات
export async function fetchCategories() {
  try {
    // استخدام Fake Store API كبديل
    const response = await fetch('https://fakestoreapi.com/products/categories');
    if (!response.ok) throw new Error('فشل في جلب البيانات');
    return await response.json();
  } catch (error) {
    console.error('خطأ في جلب الفئات:', error);
    // إرجاع مصفوفة فارغة في حالة الخطأ
    return [];
  }
}