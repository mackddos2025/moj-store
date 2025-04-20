import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Settings {
  id: string;
  store_name: string;
  store_description: string;
  store_email: string;
  store_phone: string;
  store_address: string;
  store_city: string;
  store_postal_code: string;
  shipping_fee: number;
  tax_rate: number;
  currency: string;
  language: string;
  theme: string;
}

export default function AdminSettings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function checkAdminStatus() {
      try {
        console.log('Checking admin status...');
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('No authenticated user');
          navigate('/login');
          return;
        }

        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking admin status:', error);
          toast.error('حدث خطأ في التحقق من صلاحيات المسؤول');
          navigate('/');
          return;
        }

        console.log('User role:', data?.role);
        if (data?.role !== 'admin') {
          console.log('User is not an admin');
          toast.error('غير مصرح لك بالوصول إلى إدارة الإعدادات');
          navigate('/');
          return;
        }

        setIsAdmin(true);
        fetchSettings();
      } catch (error) {
        console.error('Error in admin check:', error);
        toast.error('حدث خطأ في التحقق من صلاحيات المسؤول');
        navigate('/');
      }
    }

    checkAdminStatus();
  }, [navigate]);

  async function fetchSettings() {
    try {
      setLoading(true);
      console.log('Fetching settings...');
      
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching settings:', error);
        toast.error('حدث خطأ في جلب الإعدادات');
        return;
      }

      console.log('Settings fetched successfully');
      setSettings(data);
    } catch (error) {
      console.error('Error in fetch settings:', error);
      toast.error('حدث خطأ في جلب الإعدادات');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;

    try {
      setIsSaving(true);
      console.log('Saving settings...');
      
      const { error } = await supabase
        .from('settings')
        .update(settings)
        .eq('id', settings.id);

      if (error) {
        console.error('Error saving settings:', error);
        toast.error('حدث خطأ في حفظ الإعدادات');
        return;
      }

      console.log('Settings saved successfully');
      toast.success('تم حفظ الإعدادات بنجاح');
    } catch (error) {
      console.error('Error in save settings:', error);
      toast.error('حدث خطأ في حفظ الإعدادات');
    } finally {
      setIsSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">غير مصرح لك بالوصول</h1>
          <p className="text-gray-600">يرجى تسجيل الدخول بحساب مسؤول للوصول إلى إدارة الإعدادات</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">لم يتم العثور على الإعدادات</h1>
          <p className="text-gray-600">يرجى المحاولة مرة أخرى لاحقاً</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">إدارة الإعدادات</h1>

      <form onSubmit={handleSaveSettings} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">معلومات المتجر</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">اسم المتجر</label>
                <input
                  type="text"
                  value={settings.store_name}
                  onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">وصف المتجر</label>
                <textarea
                  value={settings.store_description}
                  onChange={(e) => setSettings({ ...settings, store_description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={settings.store_email}
                  onChange={(e) => setSettings({ ...settings, store_email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">رقم الهاتف</label>
                <input
                  type="tel"
                  value={settings.store_phone}
                  onChange={(e) => setSettings({ ...settings, store_phone: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">العنوان</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">العنوان</label>
                <input
                  type="text"
                  value={settings.store_address}
                  onChange={(e) => setSettings({ ...settings, store_address: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">المدينة</label>
                <input
                  type="text"
                  value={settings.store_city}
                  onChange={(e) => setSettings({ ...settings, store_city: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">الرمز البريدي</label>
                <input
                  type="text"
                  value={settings.store_postal_code}
                  onChange={(e) => setSettings({ ...settings, store_postal_code: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">الإعدادات المالية</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">رسوم الشحن</label>
                <input
                  type="number"
                  value={settings.shipping_fee}
                  onChange={(e) => setSettings({ ...settings, shipping_fee: parseFloat(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">نسبة الضريبة (%)</label>
                <input
                  type="number"
                  value={settings.tax_rate}
                  onChange={(e) => setSettings({ ...settings, tax_rate: parseFloat(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">العملة</label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="SAR">ريال سعودي</option>
                  <option value="USD">دولار أمريكي</option>
                  <option value="EUR">يورو</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">إعدادات الموقع</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">اللغة</label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">المظهر</label>
                <select
                  value={settings.theme}
                  onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="light">فاتح</option>
                  <option value="dark">داكن</option>
                  <option value="system">نظام</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </button>
        </div>
      </form>
    </div>
  );
} 