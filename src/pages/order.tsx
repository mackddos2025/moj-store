import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Order } from "@/lib/db/models";
import { User } from "@/lib/stores/auth-store";
import { useThemeStore } from "@/lib/theme";
import { useAuthStore } from "@/lib/stores/auth-store";
import { format } from "date-fns";
import { ArrowLeft, Clock, Package, ShoppingBag, Truck, Loader2 } from "lucide-react";

interface OrderWithUser extends Order {
  user: User;
}

const OrderPage = () => {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderWithUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId || !user) return;
      
      try {
        const orders = await api.getOrders();
        const foundOrder = orders.find(o => o.id === orderId);
        if (foundOrder) {
          setOrder(foundOrder as OrderWithUser);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrder();
  }, [orderId, user]);

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <ShoppingBag className="h-5 w-5 text-green-500" />;
      case 'shipping':
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 'delivered':
        return <Package className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <Package className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'بانتظار المراجعة';
      case 'approved':
        return 'تمت الموافقة';
      case 'shipping':
        return 'قيد التوصيل';
      case 'delivered':
        return 'تم التسليم';
      case 'cancelled':
        return 'تم الإلغاء';
      default:
        return 'بانتظار المراجعة';
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return theme === 'dark' ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-700';
      case 'approved':
        return theme === 'dark' ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700';
      case 'shipping':
        return theme === 'dark' ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700';
      case 'delivered':
        return theme === 'dark' ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700';
      case 'cancelled':
        return theme === 'dark' ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700';
      default:
        return theme === 'dark' ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-700';
    }
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto py-16 text-center">
          <h1 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
            يرجى تسجيل الدخول
          </h1>
          <p className="text-muted-foreground mb-8">
            يجب عليك تسجيل الدخول لعرض تفاصيل الطلب
          </p>
          <Button 
            className={`${
              theme === 'dark' 
                ? 'bg-blue-600 hover:bg-blue-700 shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:shadow-[0_0_20px_rgba(37,99,235,0.7)]' 
                : 'bg-blue-600 hover:bg-blue-700'
            } transition-all duration-300`}
            onClick={() => navigate('/login')}
          >
            تسجيل الدخول
          </Button>
        </div>
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="container mx-auto py-16 text-center">
          <h1 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
            الطلب غير موجود
          </h1>
          <p className="text-muted-foreground mb-8">
            لم يتم العثور على الطلب المطلوب
          </p>
          <Button 
            className={`${
              theme === 'dark' 
                ? 'bg-blue-600 hover:bg-blue-700 shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:shadow-[0_0_20px_rgba(37,99,235,0.7)]' 
                : 'bg-blue-600 hover:bg-blue-700'
            } transition-all duration-300`}
            onClick={() => navigate('/orders')}
          >
            العودة إلى الطلبات
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <Button
            variant="ghost"
            className={`${
              theme === 'dark'
                ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/30'
                : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
            }`}
            onClick={() => navigate('/orders')}
          >
            <ArrowLeft className="h-5 w-5 ml-2" />
            العودة إلى الطلبات
          </Button>
          <h1 className={`text-3xl font-bold text-center ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
            تفاصيل الطلب #{order.id.substring(order.id.length - 6)}
          </h1>
          <div className="w-24" /> {/* Placeholder for alignment */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className={`border ${
              theme === 'dark' ? 'border-blue-800 bg-blue-950/30' : 'border-blue-200'
            }`}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className={theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}>
                    معلومات الطلب
                  </CardTitle>
                  <div className={`px-3 py-1 rounded-full text-sm flex items-center ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="mr-1">{getStatusText(order.status)}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium mb-2">المنتجات:</h3>
                      <ul className="space-y-2">
                        {order.items.map((item) => (
                          <li key={item.id} className="flex justify-between">
                            <span>{item.product.name} × {item.quantity}</span>
                            <span className={theme === 'dark' ? 'text-green-400' : 'text-green-600'}>
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">المجموع:</h3>
                      <div className={`text-xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                        ${order.total.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">تاريخ الطلب:</span>
                      <span>{format(new Date(order.createdAt), 'dd/MM/yyyy')}</span>
                    </div>
                    {order.expectedDeliveryTime && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">وقت التسليم المتوقع:</span>
                        <span>{format(new Date(order.expectedDeliveryTime), 'dd/MM/yyyy')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className={`border ${
              theme === 'dark' ? 'border-blue-800 bg-blue-950/30' : 'border-blue-200'
            }`}>
              <CardHeader>
                <CardTitle className={theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}>
                  معلومات العميل
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">الاسم:</h3>
                    <p>{order.user.name}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">البريد الإلكتروني:</h3>
                    <p>{order.user.email}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">رقم الهاتف:</h3>
                    <p>{order.user.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrderPage; 