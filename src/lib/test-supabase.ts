import { supabase } from './supabase';

export async function testSupabaseConnection() {
  try {
    console.log('=== بدء اختبار اتصال Supabase ===');
    console.log('1. التحقق من متغيرات البيئة:');
    console.log('   - Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('   - Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'موجود' : 'مفقود');

    console.log('\n2. محاولة الاتصال بقاعدة البيانات...');
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .limit(1);

    if (error) {
      console.log('\n=== خطأ في الاتصال ===');
      console.log('رمز الخطأ:', error.code);
      console.log('رسالة الخطأ:', error.message);
      console.log('التفاصيل:', error.details);
      console.log('تلميح:', error.hint);
      return false;
    }

    console.log('\n=== اتصال ناجح ===');
    console.log('تم استلام البيانات:', data);
    return true;
  } catch (error) {
    console.error('خطأ غير متوقع:', error);
    return false;
  }
} 