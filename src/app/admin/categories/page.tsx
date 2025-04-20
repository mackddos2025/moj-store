import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { ImageIcon } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  image: string;
  created_at: string;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    image: ''
  });

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchCategories();
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('يجب تسجيل الدخول أولاً');
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setIsAdmin(data.role === 'admin');
    } catch (error) {
      console.error('Error checking admin status:', error);
      toast.error('حدث خطأ في التحقق من الصلاحيات');
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('حدث خطأ في جلب الفئات');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('Error checking user role:', userError);
        throw userError;
      }
      if (userData.role !== 'admin') {
        toast.error('غير مصرح لك بإضافة فئات');
        return;
      }

      // التحقق من الحقول المطلوبة
      if (!formData.name.trim()) {
        toast.error('يرجى إدخال اسم الفئة');
        return;
      }

      // التحقق من عدم تكرار اسم الفئة
      const { data: existingCategory, error: checkError } = await supabase
        .from('categories')
        .select('id')
        .eq('name', formData.name.trim())
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 هو خطأ "لم يتم العثور على نتائج"
        console.error('Error checking category existence:', checkError);
        throw checkError;
      }

      if (existingCategory) {
        toast.error('اسم الفئة موجود مسبقاً');
        return;
      }

      // إضافة الفئة
      const { data: newCategory, error: insertError } = await supabase
        .from('categories')
        .insert([{
          name: formData.name.trim(),
          image: formData.image || null
        }])
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting category:', insertError);
        throw insertError;
      }

      console.log('New category added:', newCategory);

      // تحديث حالة المكون
      setCategories(prevCategories => [...prevCategories, newCategory]);
      
      // إغلاق النافذة المنبثقة
      setShowModal(false);
      
      // إعادة تعيين نموذج البيانات
      setFormData({
        name: '',
        image: ''
      });

      // عرض رسالة نجاح واحدة فقط
      toast.success('تم إضافة الفئة بنجاح');
    } catch (error: any) {
      console.error('Error in add operation:', error);
      toast.error(error.message || 'حدث خطأ في إضافة الفئة. يرجى المحاولة مرة أخرى');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      image: category.image || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الفئة؟')) return;

    try {
      console.log('Starting delete process for category ID:', id);

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
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('Error checking user role:', userError);
        throw userError;
      }
      if (userData.role !== 'admin') {
        toast.error('غير مصرح لك بحذف الفئات');
        return;
      }

      // التحقق من وجود الفئة قبل حذفها
      const { data: category, error: checkError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

      if (checkError) {
        console.error('Error checking category existence:', checkError);
        throw checkError;
      }
      if (!category) {
        toast.error('الفئة غير موجودة');
        return;
      }

      console.log('Category to delete:', category);

      // التحقق من وجود منتجات مرتبطة بالفئة
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id')
        .eq('category_id', id);

      if (productsError) {
        console.error('Error checking related products:', productsError);
        throw productsError;
      }

      if (products && products.length > 0) {
        toast.error('لا يمكن حذف الفئة لأنها تحتوي على منتجات');
        return;
      }

      // حذف الفئة
      const { data: deleteData, error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .select();

      if (deleteError) {
        console.error('Error deleting category:', deleteError);
        throw deleteError;
      }

      console.log('Delete response:', deleteData);

      // تحديث حالة المكون
      setCategories(prevCategories => prevCategories.filter(cat => cat.id !== id));
      
      // عرض رسالة نجاح واحدة فقط
      toast.success('تم حذف الفئة بنجاح');
    } catch (error: any) {
      console.error('Error in delete operation:', error);
      toast.error(error.message || 'حدث خطأ في حذف الفئة. يرجى المحاولة مرة أخرى');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600">غير مصرح لك بالوصول إلى هذه الصفحة</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          إدارة الفئات
        </h1>
        <button
          onClick={() => {
            setEditingCategory(null);
            setFormData({
              name: '',
              image: ''
            });
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          إضافة فئة جديدة
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  الصورة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  الاسم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {category.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 mr-4"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                {editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    اسم الفئة
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    رابط الصورة
                  </label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 