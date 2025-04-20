import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    role: 'user',
  });

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
          toast.error('غير مصرح لك بالوصول إلى إدارة المستخدمين');
          navigate('/');
          return;
        }

        setIsAdmin(true);
        fetchUsers();
      } catch (error) {
        console.error('Error in admin check:', error);
        toast.error('حدث خطأ في التحقق من صلاحيات المسؤول');
        navigate('/');
      }
    }

    checkAdminStatus();
  }, [navigate]);

  async function fetchUsers() {
    try {
      setLoading(true);
      console.log('Fetching users...');
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        toast.error('حدث خطأ في جلب المستخدمين');
        return;
      }

      console.log('Users fetched successfully');
      setUsers(data || []);
    } catch (error) {
      console.error('Error in fetch users:', error);
      toast.error('حدث خطأ في جلب المستخدمين');
    } finally {
      setLoading(false);
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // التحقق من وجود المستخدم وصلاحياته
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }
      if (!user) {
        toast.error('يجب تسجيل الدخول أولاً');
        return;
      }

      // التحقق من أن المستخدم مدير
      const { data: adminCheck, error: adminError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (adminError) {
        console.error('Error checking admin status:', adminError);
        throw adminError;
      }

      if (!adminCheck || adminCheck.role !== 'admin') {
        toast.error('غير مصرح لك بإضافة مستخدمين');
        return;
      }

      // التحقق من الحقول المطلوبة
      if (!newUser.email.trim() || !newUser.password.trim()) {
        toast.error('يرجى إدخال البريد الإلكتروني وكلمة المرور');
        return;
      }

      // التحقق من صحة البريد الإلكتروني
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newUser.email.trim())) {
        toast.error('يرجى إدخال بريد إلكتروني صحيح');
        return;
      }

      // التحقق من قوة كلمة المرور
      if (newUser.password.length < 6) {
        toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        return;
      }

      // التحقق من عدم وجود المستخدم بالفعل
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('email', newUser.email.trim())
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking user existence:', checkError);
        throw checkError;
      }

      if (existingUser) {
        toast.error('البريد الإلكتروني مستخدم بالفعل');
        return;
      }

      // إنشاء المستخدم في Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: newUser.email.trim(),
        password: newUser.password.trim(),
      });

      if (signUpError) {
        console.error('Error creating auth user:', signUpError);
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error('فشل في إنشاء المستخدم');
      }

      // إضافة المستخدم إلى جدول users
      const { data: newUserData, error: insertError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email: newUser.email.trim(),
          role: newUser.role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting user:', insertError);
        throw insertError;
      }

      console.log('New user added:', newUserData);

      // تحديث حالة المكون
      setUsers(prevUsers => [...prevUsers, newUserData as User]);
      
      // إغلاق النافذة المنبثقة
      setShowModal(false);
      
      // إعادة تعيين نموذج البيانات
      setNewUser({
        email: '',
        password: '',
        role: 'user'
      });

      toast.success('تم إضافة المستخدم بنجاح');
    } catch (error: any) {
      console.error('Error in add user operation:', error);
      toast.error(error.message || 'حدث خطأ في إضافة المستخدم. يرجى المحاولة مرة أخرى');
    }
  };

  async function handleDeleteUser(id: string) {
    try {
      console.log('Deleting user...');
      
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting user:', error);
        toast.error('حدث خطأ في حذف المستخدم');
        return;
      }

      console.log('User deleted successfully');
      toast.success('تم حذف المستخدم بنجاح');
      fetchUsers();
    } catch (error) {
      console.error('Error in delete user:', error);
      toast.error('حدث خطأ في حذف المستخدم');
    }
  }

  async function handleUpdateRole(id: string, newRole: string) {
    try {
      console.log('Updating user role...');
      
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', id);

      if (error) {
        console.error('Error updating user role:', error);
        toast.error('حدث خطأ في تحديث دور المستخدم');
        return;
      }

      console.log('User role updated successfully');
      toast.success('تم تحديث دور المستخدم بنجاح');
      fetchUsers();
    } catch (error) {
      console.error('Error in update user role:', error);
      toast.error('حدث خطأ في تحديث دور المستخدم');
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
          <p className="text-gray-600">يرجى تسجيل الدخول بحساب مسؤول للوصول إلى إدارة المستخدمين</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          إضافة مستخدم جديد
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  البريد الإلكتروني
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الدور
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تاريخ التسجيل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  آخر تسجيل دخول
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    لا توجد مستخدمين
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                        className="border rounded-md px-2 py-1"
                      >
                        <option value="user">مستخدم</option>
                        <option value="admin">مسؤول</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'لم يسجل دخول'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">إضافة مستخدم جديد</h3>
              <div className="mt-2 px-7 py-3">
                <input
                  type="email"
                  placeholder="البريد الإلكتروني"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="mb-2 w-full px-3 py-2 border rounded-md"
                />
                <input
                  type="password"
                  placeholder="كلمة المرور"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="mb-2 w-full px-3 py-2 border rounded-md"
                />
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="mb-2 w-full px-3 py-2 border rounded-md"
                >
                  <option value="user">مستخدم</option>
                  <option value="admin">مسؤول</option>
                </select>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={handleAddUser}
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  إضافة
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="ml-2 px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 