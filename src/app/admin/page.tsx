import React from 'react';
import { useNavigate, Link, Outlet } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ShoppingCart, Users, Package, CreditCard } from 'lucide-react';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = React.useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = React.useState(true);
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setLoading(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error('يجب تسجيل الدخول أولاً');
          navigate('/auth/login');
          return;
        }

        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (userData?.role !== 'admin') {
          toast.error('ليس لديك صلاحيات الوصول');
          navigate('/');
          return;
        }

        setIsAdmin(true);

        // جلب الإحصائيات
        const [
          { count: productsCount },
          { count: ordersCount },
          { count: usersCount },
          { data: revenueData }
        ] = await Promise.all([
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('users').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('total')
        ]);

        const totalRevenue = revenueData?.reduce((sum, order) => sum + order.total, 0) || 0;

        setStats({
          totalProducts: productsCount || 0,
          totalOrders: ordersCount || 0,
          totalUsers: usersCount || 0,
          totalRevenue,
        });
      } catch (error: any) {
        toast.error(error.message || 'حدث خطأ في جلب البيانات');
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [navigate]);

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
          <p className="text-gray-600">يرجى تسجيل الدخول بحساب مسؤول للوصول إلى لوحة التحكم</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">لوحة التحكم</h1>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-500 mr-4" />
            <div>
              <p className="text-gray-500">المنتجات</p>
              <p className="text-2xl font-bold">{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ShoppingCart className="h-8 w-8 text-green-500 mr-4" />
            <div>
              <p className="text-gray-500">الطلبات</p>
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-500 mr-4" />
            <div>
              <p className="text-gray-500">المستخدمين</p>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-yellow-500 mr-4" />
            <div>
              <p className="text-gray-500">إجمالي المبيعات</p>
              <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* الإجراءات السريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/admin/products"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-4">إدارة المنتجات</h2>
          <p className="text-gray-600">إضافة وتعديل وحذف المنتجات</p>
        </Link>

        <Link
          to="/admin/orders"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-4">إدارة الطلبات</h2>
          <p className="text-gray-600">عرض وتحديث حالة الطلبات</p>
        </Link>

        <Link
          to="/admin/users"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-4">إدارة المستخدمين</h2>
          <p className="text-gray-600">عرض وتعديل حسابات المستخدمين</p>
        </Link>

        <Link
          to="/admin/categories"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-4">إدارة الفئات</h2>
          <p className="text-gray-600">إضافة وتعديل الفئات</p>
        </Link>

        <Link
          to="/admin/reports"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-4">التقارير</h2>
          <p className="text-gray-600">عرض تقارير المبيعات والإحصائيات</p>
        </Link>

        <Link
          to="/admin/settings"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-4">الإعدادات</h2>
          <p className="text-gray-600">تعديل إعدادات المتجر</p>
        </Link>
      </div>

      {/* Render child routes */}
      <Outlet />
    </div>
  );
} 