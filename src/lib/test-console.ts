import { supabase } from './supabase';

export async function runConsoleTests() {
  console.log('=== بدء اختبارات وحدة التحكم ===');

  // اختبار 1: التحقق من متغيرات البيئة
  console.log('\nاختبار 1: التحقق من متغيرات البيئة');
  console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY);

  // اختبار 2: التحقق من اتصال Supabase
  console.log('\nاختبار 2: التحقق من اتصال Supabase');
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .limit(1);

    if (error) {
      console.error('خطأ في الاتصال:', error);
    } else {
      console.log('الاتصال ناجح:', data);
    }
  } catch (err) {
    console.error('خطأ غير متوقع:', err);
  }

  // اختبار 3: التحقق من الجداول
  console.log('\nاختبار 3: التحقق من الجداول');
  const tables = ['categories', 'products', 'users', 'orders'];
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);

      if (error) {
        console.error(`خطأ في جدول ${table}:`, error);
      } else {
        console.log(`جدول ${table} موجود:`, data);
      }
    } catch (err) {
      console.error(`خطأ في التحقق من جدول ${table}:`, err);
    }
  }

  console.log('\n=== انتهاء الاختبارات ===');
} 