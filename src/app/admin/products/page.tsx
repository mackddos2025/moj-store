import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  cost_price: number;
  image_url: string;
  stock: number;
  category_id: number;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
}

type PricingMethod = 'manual' | 'percentage' | 'profit';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [pricingMethod, setPricingMethod] = useState<PricingMethod>('manual');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    cost_price: '',
    stock: '',
    category_id: '',
    image_url: '',
    percentage_markup: '',
    profit_margin: ''
  });

  useEffect(() => {
    checkAdminStatus();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
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
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
      setCategories(data || []);
    } catch (error) {
      console.error('Error in fetch categories:', error);
      toast.error('حدث خطأ في جلب الأقسام');
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          cost_price,
          stock,
          category_id,
          image_url,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
      setProducts(data || []);
    } catch (error) {
      console.error('Error in fetch products:', error);
      toast.error('حدث خطأ في جلب المنتجات');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Calculate price based on pricing method
    if (name === 'cost_price' || name === 'percentage_markup' || name === 'profit_margin') {
      const costPrice = name === 'cost_price' ? parseFloat(value) : parseFloat(formData.cost_price) || 0;
      
      if (pricingMethod === 'percentage') {
        const markup = name === 'percentage_markup' ? parseFloat(value) : parseFloat(formData.percentage_markup) || 0;
        const calculatedPrice = costPrice + (costPrice * markup / 100);
        setFormData(prev => ({ ...prev, price: calculatedPrice.toFixed(2) }));
      } else if (pricingMethod === 'profit') {
        const profit = name === 'profit_margin' ? parseFloat(value) : parseFloat(formData.profit_margin) || 0;
        const calculatedPrice = costPrice + profit;
        setFormData(prev => ({ ...prev, price: calculatedPrice.toFixed(2) }));
      }
    }
  };

  const handlePricingMethodChange = (method: PricingMethod) => {
    setPricingMethod(method);
    const costPrice = parseFloat(formData.cost_price) || 0;
    
    if (method === 'percentage') {
      const markup = parseFloat(formData.percentage_markup) || 0;
      const calculatedPrice = costPrice + (costPrice * markup / 100);
      setFormData(prev => ({ ...prev, price: calculatedPrice.toFixed(2) }));
    } else if (method === 'profit') {
      const profit = parseFloat(formData.profit_margin) || 0;
      const calculatedPrice = costPrice + profit;
      setFormData(prev => ({ ...prev, price: calculatedPrice.toFixed(2) }));
    } else {
      // Manual pricing - keep the current price
      setFormData(prev => ({ ...prev, price: prev.price }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('يجب تسجيل الدخول أولاً');
        return;
      }

      // التحقق من القيم المطلوبة
      if (!formData.name.trim()) {
        toast.error('يرجى إدخال اسم المنتج');
        return;
      }

      if (!formData.description.trim()) {
        toast.error('يرجى إدخال وصف المنتج');
        return;
      }

      if (!formData.category_id) {
        toast.error('يرجى اختيار القسم');
        return;
      }

      // تحويل القيم إلى أرقام
      const costPrice = parseFloat(formData.cost_price);
      const price = parseFloat(formData.price);
      const stock = parseInt(formData.stock);

      // التحقق من صحة القيم الرقمية
      if (isNaN(costPrice) || costPrice <= 0) {
        toast.error('يرجى إدخال سعر تكلفة صحيح');
        return;
      }

      if (isNaN(price) || price <= 0) {
        toast.error('يرجى إدخال سعر بيع صحيح');
        return;
      }

      if (isNaN(stock) || stock < 0) {
        toast.error('يرجى إدخال كمية مخزون صحيحة');
        return;
      }

      if (price <= costPrice) {
        toast.error('سعر البيع يجب أن يكون أكبر من سعر التكلفة');
        return;
      }

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: price,
        cost_price: costPrice,
        stock: stock,
        category_id: formData.category_id,
        image_url: formData.image_url.trim() || null,
        updated_at: new Date().toISOString()
      };

      if (editingProduct) {
        // تحديث المنتج
        const { data, error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)
          .select();

        if (error) {
          console.error('Error updating product:', error);
          throw error;
        }

        if (data && data.length > 0) {
          // تحديث قائمة المنتجات
          setProducts(prevProducts => 
            prevProducts.map(p => 
              p.id === editingProduct.id ? { ...p, ...data[0] } : p
            )
          );
          toast.success('تم تحديث المنتج بنجاح');
        }
      } else {
        // إضافة منتج جديد
        const { data, error } = await supabase
          .from('products')
          .insert([{
            ...productData,
            created_at: new Date().toISOString()
          }])
          .select();

        if (error) {
          console.error('Error adding product:', error);
          throw error;
        }

        if (data && data.length > 0) {
          setProducts(prevProducts => [...prevProducts, data[0]]);
          toast.success('تم إضافة المنتج بنجاح');
        }
      }

      setShowModal(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        cost_price: '',
        stock: '',
        category_id: '',
        image_url: '',
        percentage_markup: '',
        profit_margin: ''
      });
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('حدث خطأ في حفظ المنتج. يرجى المحاولة مرة أخرى');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      cost_price: product.cost_price.toString(),
      stock: product.stock.toString(),
      category_id: product.category_id ? product.category_id.toString() : '',
      image_url: product.image_url || '',
      percentage_markup: '',
      profit_margin: ''
    });
    setPricingMethod('manual');
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('تم حذف المنتج بنجاح');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('حدث خطأ في حذف المنتج');
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
          إدارة المنتجات
        </h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            setFormData({
              name: '',
              description: '',
              price: '',
              cost_price: '',
              stock: '',
              category_id: '',
              image_url: '',
              percentage_markup: '',
              profit_margin: ''
            });
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          إضافة منتج جديد
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
                  القسم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  السعر
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  المخزون
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
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
                      {product.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {product.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {categories.find(c => c.id === product.category_id)?.name || 'غير محدد'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {product.price} ريال
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {product.stock}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 mr-4"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
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
                {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    القسم
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">اختر القسم</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    اسم المنتج
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
                    الوصف
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    سعر التكلفة
                  </label>
                  <input
                    type="number"
                    name="cost_price"
                    value={formData.cost_price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    طريقة التسعير
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => handlePricingMethodChange('manual')}
                      className={`px-4 py-2 rounded-lg ${
                        pricingMethod === 'manual'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      يدوي
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePricingMethodChange('percentage')}
                      className={`px-4 py-2 rounded-lg ${
                        pricingMethod === 'percentage'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      نسبي
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePricingMethodChange('profit')}
                      className={`px-4 py-2 rounded-lg ${
                        pricingMethod === 'profit'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      ربح
                    </button>
                  </div>
                </div>

                {pricingMethod === 'manual' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      سعر البيع
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                )}

                {pricingMethod === 'percentage' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      نسبة الربح (%)
                    </label>
                    <input
                      type="number"
                      name="percentage_markup"
                      value={formData.percentage_markup}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      سعر البيع: {formData.price} ريال
                    </div>
                  </div>
                )}

                {pricingMethod === 'profit' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      قيمة الربح
                    </label>
                    <input
                      type="number"
                      name="profit_margin"
                      value={formData.profit_margin}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      سعر البيع: {formData.price} ريال
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    المخزون
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    رابط الصورة
                  </label>
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
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