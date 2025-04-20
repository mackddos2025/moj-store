import { supabase } from './supabase';

export async function resetPolicies() {
  try {
    console.log('=== بدء إعادة تعيين السياسات ===');

    // إعادة تعيين سياسات جدول users
    const { error: usersError } = await supabase
      .from('users')
      .delete()
      .neq('id', 'dummy'); // حذف جميع السياسات

    if (usersError) {
      console.error('خطأ في إعادة تعيين سياسات users:', usersError);
    } else {
      console.log('تم إعادة تعيين سياسات users بنجاح');
    }

    // إضافة سياسات جديدة لجدول users
    const { error: newUsersPolicyError } = await supabase
      .from('users')
      .insert({
        id: 'dummy',
        name: 'dummy',
        email: 'dummy@example.com',
        phone: '0000000000',
        role: 'customer',
        created_at: new Date().toISOString()
      });

    if (newUsersPolicyError) {
      console.error('خطأ في إضافة سياسات جديدة لـ users:', newUsersPolicyError);
    } else {
      console.log('تمت إضافة السياسات الجديدة لـ users بنجاح');
    }

    // إعادة تعيين سياسات الجداول الأخرى
    const tables = ['categories', 'products', 'orders'];
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', 'dummy');

      if (error) {
        console.error(`خطأ في إعادة تعيين سياسات ${table}:`, error);
      } else {
        console.log(`تم إعادة تعيين سياسات ${table} بنجاح`);
      }
    }

    console.log('=== انتهاء إعادة تعيين السياسات ===');
    return true;
  } catch (error) {
    console.error('خطأ غير متوقع في إعادة تعيين السياسات:', error);
    return false;
  }
} 