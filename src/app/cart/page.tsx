import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url: string;
}

interface CartItem {
  id: string;
  quantity: number;
  product: Product;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export default function CartPage() {
  const [cartItems, setCartItems] = React.useState<CartItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [users, setUsers] = React.useState<User[]>([]);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const navigate = useNavigate();

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      const { data: cartData, error: cartError } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          product_id,
          products (
            id,
            name,
            price,
            stock,
            image_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (cartError) {
        console.error('Error fetching cart items:', cartError);
        setError('حدث خطأ أثناء جلب محتويات السلة');
        setLoading(false);
        return;
      }

      if (!cartData) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      const transformedData = cartData.map(item => {
        if (!item.products || !Array.isArray(item.products) || item.products.length === 0) {
          console.warn(`No product found for cart item ${item.id}`);
          return null;
        }

        const product = item.products[0];
        if (!product) {
          console.warn(`Invalid product data for cart item ${item.id}`);
          return null;
        }

        return {
          id: item.id,
          quantity: item.quantity,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            stock: product.stock,
            image_url: product.image_url
          }
        };
      }).filter(Boolean) as CartItem[];

      setCartItems(transformedData);
    } catch (error) {
      console.error('Error in fetchCartItems:', error);
      setError('حدث خطأ أثناء جلب محتويات السلة');
    } finally {
      setLoading(false);
    }
  };

  // Update useEffect to prevent state updates during render
  React.useEffect(() => {
    let mounted = true;
    
    const loadCart = async () => {
      if (mounted) {
        await fetchCartItems();
      }
    };

    loadCart();

    return () => {
      mounted = false;
    };
  }, []);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    try {
      const item = cartItems.find(item => item.id === itemId);
      if (!item) return;

      // Check if the new quantity exceeds available stock
      if (newQuantity > item.product.stock) {
        setError(`الكمية المطلوبة (${newQuantity}) تتجاوز المخزون المتاح (${item.product.stock})`);
        return;
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId);

      if (error) throw error;

      // Update local state immediately
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );

      // Refresh cart items to ensure consistency
      fetchCartItems();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      // Update local state immediately
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));

      // Refresh cart items to ensure consistency
      fetchCartItems();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const addToCart = async (productId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('يجب تسجيل الدخول لإضافة المنتجات للسلة');
        return;
      }

      // التحقق من وجود المنتج في السلة
      const { data: existingItem, error: checkError } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking cart:', checkError);
        return;
      }

      if (existingItem) {
        // تحديث الكمية إذا كان المنتج موجوداً
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);

        if (updateError) {
          console.error('Error updating cart:', updateError);
          return;
        }
      } else {
        // إضافة منتج جديد للسلة
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert([
            {
              user_id: user.id,
              product_id: productId,
              quantity: 1
            }
          ]);

        if (insertError) {
          console.error('Error adding to cart:', insertError);
          return;
        }
      }

      setError(null);
      fetchCartItems();
    } catch (error) {
      console.error('Error in addToCart:', error);
      setError('حدث خطأ أثناء إضافة المنتج للسلة');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // التحقق من صحة البريد الإلكتروني
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        setError('الرجاء إدخال بريد إلكتروني صحيح');
        return;
      }

      // التحقق من قوة كلمة المرور
      if (password.length < 6) {
        setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        return;
      }

      // إنشاء مستخدم جديد
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password.trim(),
        options: {
          data: {
            full_name: name.trim(),
            role: 'user'
          }
        }
      });

      if (authError) {
        console.error('Error creating auth user:', authError);
        setError('حدث خطأ أثناء إنشاء المستخدم');
        return;
      }

      if (!authData.user) {
        setError('لم يتم إنشاء المستخدم');
        return;
      }

      // إضافة المستخدم إلى جدول users
      const { error: dbError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email: authData.user.email,
            full_name: name.trim(),
            role: 'user'
          }
        ]);

      if (dbError) {
        console.error('Error adding user to database:', dbError);
        setError('حدث خطأ أثناء إضافة المستخدم');
        return;
      }

      // تحديث قائمة المستخدمين
      await fetchUsers();
      
      // إعادة تعيين النموذج
      setName('');
      setEmail('');
      setPassword('');
      
      setSuccess('تم إضافة المستخدم بنجاح');
    } catch (error) {
      console.error('Error in add user operation:', error);
      setError('حدث خطأ أثناء إضافة المستخدم');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        setError('حدث خطأ أثناء جلب المستخدمين');
        return;
      }

      setUsers(users || []);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      setError('حدث خطأ أثناء جلب المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  // استخدام useEffect للتحميل الأولي
  React.useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <div className="text-center py-12">جاري التحميل...</div>;
  if (error) return <div className="text-center py-12 text-red-600">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">سلة التسوق</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">سلة التسوق فارغة</p>
          <Link
            to="/products"
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            تصفح المنتجات
          </Link>
        </div>
      ) : (
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          <div className="lg:col-span-7">
            <ul className="border-t border-b border-gray-200 divide-y divide-gray-200">
              {cartItems.map((item) => (
                <li key={item.id} className="flex py-6 sm:py-10">
                  <div className="flex-shrink-0">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-24 h-24 rounded-md object-center object-cover sm:w-32 sm:h-32"
                    />
                  </div>

                  <div className="mr-4 flex-1 flex flex-col sm:flex-row">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        <Link to={`/products/${item.product.id}`}>
                          {item.product.name}
                        </Link>
                      </h4>
                      <p className="mt-1 text-sm text-gray-500">
                        {item.product.price} ل.س
                      </p>
                    </div>

                    <div className="mt-4 sm:mt-0 sm:pr-9">
                      <div className="flex items-center">
                        <label htmlFor={`quantity-${item.id}`} className="mr-2">
                          الكمية
                        </label>
                        <select
                          id={`quantity-${item.id}`}
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateQuantity(item.id, Number(e.target.value))
                          }
                          className="max-w-full rounded-md border border-gray-300 py-1.5 text-base leading-5 font-medium text-gray-700 text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          {[...Array(10)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mt-4 sm:mt-0">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          إزالة
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 lg:mt-0 lg:col-span-5">
            <div className="bg-gray-50 rounded-lg px-4 py-6 sm:p-6 lg:p-8">
              <h2 className="text-lg font-medium text-gray-900">ملخص الطلب</h2>
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">المجموع</p>
                  <p className="text-sm font-medium text-gray-900">{total} ل.س</p>
                </div>
              </div>
              <div className="mt-6">
                <Link
                  to="/checkout"
                  className="w-full bg-indigo-600 border border-transparent rounded-md py-3 px-4 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  إتمام الطلب
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 