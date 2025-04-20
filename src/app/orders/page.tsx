import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Order {
  id: string;
  created_at: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  total: number;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  order_items: {
    quantity: number;
    price: number;
    product: {
      name: string;
      image: string;
    };
  }[];
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth/login');
          return;
        }

        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            created_at,
            status,
            total,
            shipping_address,
            shipping_city,
            shipping_postal_code,
            order_items (
              quantity,
              price,
              product:products (
                name,
                image
              )
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Type assertion to ensure data matches our Order interface
        const typedOrders = (data || []).map(order => ({
          ...order,
          order_items: order.order_items.map(item => ({
            ...item,
            product: item.product[0] // Take the first product since it's a one-to-one relationship
          }))
        })) as Order[];
        
        setOrders(typedOrders);
      } catch (error: any) {
        setError(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتمل';
      case 'processing':
        return 'قيد المعالجة';
      case 'cancelled':
        return 'ملغي';
      default:
        return 'قيد الانتظار';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) return <div className="text-center py-12">جاري التحميل...</div>;
  if (error) return <div className="text-center py-12 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            طلباتي
          </h1>
        </div>

        {orders.length === 0 ? (
          <div className="mt-12 text-center">
            <h3 className="text-lg font-medium text-gray-900">لا توجد طلبات</h3>
            <p className="mt-2 text-sm text-gray-500">
              لم تقم بإجراء أي طلبات حتى الآن.
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/products')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                تصفح المنتجات
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-8">
            <div className="space-y-8">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white shadow overflow-hidden sm:rounded-lg"
                >
                  <div className="px-4 py-5 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          الطلب #{order.id}
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-gray-200">
                    <dl>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          العنوان
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {order.shipping_address}، {order.shipping_city}،{' '}
                          {order.shipping_postal_code}
                        </dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          المنتجات
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                            {order.order_items.map((item, index) => (
                              <li
                                key={index}
                                className="pl-3 pr-4 py-3 flex items-center justify-between text-sm"
                              >
                                <div className="w-0 flex-1 flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <img
                                      className="h-10 w-10 rounded-full"
                                      src={item.product.image}
                                      alt={item.product.name}
                                    />
                                  </div>
                                  <div className="ml-4 flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                      {item.product.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      الكمية: {item.quantity}
                                    </p>
                                  </div>
                                </div>
                                <div className="ml-4 flex-shrink-0">
                                  <p className="text-sm font-medium text-gray-900">
                                    {item.price * item.quantity} ريال
                                  </p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </dd>
                      </div>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          المجموع
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {order.total} ريال
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 