import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer
} from 'recharts';

interface Order {
  id: string;
  created_at: string;
  status: string;
  total: number;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  order_items: {
    id: string;
    product_id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      image: string;
    };
  }[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category_id: string;
  image: string;
  created_at: string;
}

interface SalesData {
  date: string;
  sales: number;
}

export default function AdminReports() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

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
          toast.error('غير مصرح لك بالوصول إلى التقارير والإحصائيات');
          navigate('/');
          return;
        }

        setIsAdmin(true);
        fetchData();
      } catch (error) {
        console.error('Error in admin check:', error);
        toast.error('حدث خطأ في التحقق من صلاحيات المسؤول');
        navigate('/');
      }
    }

    checkAdminStatus();
  }, [navigate]);

  async function fetchData() {
    try {
      setLoading(true);
      console.log('Fetching data...');
      
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product (
              id,
              name,
              image
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        toast.error('حدث خطأ في جلب الطلبات');
        return;
      }

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) {
        console.error('Error fetching products:', productsError);
        toast.error('حدث خطأ في جلب المنتجات');
        return;
      }

      console.log('Data fetched successfully');
      setOrders(ordersData || []);
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error in fetch data:', error);
      toast.error('حدث خطأ في جلب البيانات');
    } finally {
      setLoading(false);
    }
  }

  const salesData = React.useMemo(() => {
    const data: { date: string; sales: number }[] = [];
    const now = new Date();
    const days = timeRange === 'week' ? 7 : 30;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const daySales = orders
        .filter(order => order.created_at.startsWith(dateStr))
        .reduce((sum, order) => sum + order.total, 0);

      data.push({
        date: dateStr,
        sales: daySales
      });
    }

    return data;
  }, [orders, timeRange]);

  const orderStatusData = React.useMemo(() => {
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count
    }));
  }, [orders]);

  const totalSales = React.useMemo(() => {
    return orders.reduce((sum, order) => sum + order.total, 0);
  }, [orders]);

  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
  const lowStockProducts = products.filter(product => product.stock < 10).length;

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
          <p className="text-gray-600">يرجى تسجيل الدخول بحساب مسؤول للوصول إلى التقارير والإحصائيات</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">التقارير والإحصائيات</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">إجمالي المبيعات</h3>
          <p className="text-2xl font-bold text-blue-600">{totalSales.toFixed(2)} ريال</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">إجمالي الطلبات</h3>
          <p className="text-2xl font-bold text-green-600">{totalOrders}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">متوسط قيمة الطلب</h3>
          <p className="text-2xl font-bold text-purple-600">{averageOrderValue.toFixed(2)} ريال</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">منتجات قليلة المخزون</h3>
          <p className="text-2xl font-bold text-red-600">{lowStockProducts}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">المبيعات</h2>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as 'week' | 'month')}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="week">آخر 7 أيام</option>
              <option value="month">آخر 30 يوم</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#3B82F6" name="المبيعات" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">حالة الطلبات</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#10B981" name="عدد الطلبات" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
} 