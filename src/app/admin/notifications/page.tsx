import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  user_id: string;
}

export default function AdminNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    user_id: ''
  });
  const [sending, setSending] = useState(false);

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
          toast.error('غير مصرح لك بالوصول إلى الإشعارات');
          navigate('/');
          return;
        }

        setIsAdmin(true);
        fetchNotifications();
      } catch (error) {
        console.error('Error in admin check:', error);
        toast.error('حدث خطأ في التحقق من صلاحيات المسؤول');
        navigate('/');
      }
    }

    checkAdminStatus();
  }, [navigate]);

  async function fetchNotifications() {
    try {
      setLoading(true);
      console.log('Fetching notifications...');
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        toast.error('حدث خطأ في جلب الإشعارات');
        return;
      }

      console.log('Notifications fetched successfully');
      setNotifications(data || []);
    } catch (error) {
      console.error('Error in fetch notifications:', error);
      toast.error('حدث خطأ في جلب الإشعارات');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSending(true);
      console.log('Sending notification...');

      const { error } = await supabase
        .from('notifications')
        .insert([{
          title: formData.title,
          message: formData.message,
          user_id: formData.user_id || null,
          is_read: false
        }]);

      if (error) {
        console.error('Error sending notification:', error);
        toast.error('حدث خطأ في إرسال الإشعار');
        return;
      }

      console.log('Notification sent successfully');
      toast.success('تم إرسال الإشعار بنجاح');
      setFormData({ title: '', message: '', user_id: '' });
      fetchNotifications();
    } catch (error) {
      console.error('Error in send notification:', error);
      toast.error('حدث خطأ في إرسال الإشعار');
    } finally {
      setSending(false);
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
          <p className="text-gray-600">يرجى تسجيل الدخول بحساب مسؤول للوصول إلى الإشعارات</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">إدارة الإشعارات</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">إرسال إشعار جديد</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                العنوان
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                الرسالة
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={4}
                required
              />
            </div>

            <div>
              <label htmlFor="user_id" className="block text-sm font-medium text-gray-700 mb-1">
                معرف المستخدم (اختياري)
              </label>
              <input
                type="text"
                id="user_id"
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="اتركه فارغاً لإرسال الإشعار لجميع المستخدمين"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {sending ? 'جاري الإرسال...' : 'إرسال الإشعار'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">الإشعارات السابقة</h2>
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-center">لا توجد إشعارات</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg ${
                    notification.is_read ? 'bg-gray-50' : 'bg-blue-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold">{notification.title}</h3>
                    <span className="text-sm text-gray-500">
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-600">{notification.message}</p>
                  {notification.user_id && (
                    <p className="mt-2 text-sm text-gray-500">
                      مرسل إلى: {notification.user_id}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 