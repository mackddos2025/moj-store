import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Order } from "@/lib/db/models";
import { useThemeStore } from "@/lib/theme";
import { useAuthStore } from "@/lib/stores/auth-store";
import { format } from "date-fns";
import { ArrowRight, Clock, Package, ShoppingBag, Truck, ArrowLeft, RotateCw, Loader2 } from "lucide-react";

const OrdersPage = () => {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    
    try {
      const data = await api.getOrders(user.id);
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrders();
  };

  useEffect(() => {
    if (!user) return;
    
    fetchOrders();

    // Set up polling every 30 seconds
    const pollInterval = setInterval(fetchOrders, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(pollInterval);
  }, [user, fetchOrders]);

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
            يجب عليك تسجيل الدخول لعرض طلباتك
          </p>
          <Link to="/login">
            <Button 
              className={`${
                theme === 'dark' 
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:shadow-[0_0_20px_rgba(37,99,235,0.7)]' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } transition-all duration-300`}
            >
              تسجيل الدخول
            </Button>
          </Link>
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
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5 ml-2" />
            رجوع
          </Button>
          <h1 className={`text-3xl font-bold text-center ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
            طلباتي
          </h1>
          <Button
            variant="ghost"
            className={`${
              theme === 'dark'
                ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/30'
                : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
            }`}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-5 w-5 ml-2 animate-spin" />
            ) : (
              <RotateCw className="h-5 w-5 ml-2" />
            )}
            تحديث
          </Button>
        </div>
        
        {isLoading ? (
          <div className="space-y-6">
            {Array(3).fill(0).map((_, index) => (
              <Card key={index} className={`${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'} animate-pulse h-40`} />
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card 
                key={order.id} 
                className={`border ${
                  theme === 'dark' ? 'border-blue-800 bg-blue-950/30' : 'border-blue-200'
                } transition-all duration-300 hover:shadow-md`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className={theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}>
                      طلب #{order.id.substring(order.id.length - 6)}
                    </CardTitle>
                    <div className={`px-3 py-1 rounded-full text-sm flex items-center ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="mr-1">{getStatusText(order.status)}</span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    تاريخ الطلب: {format(new Date(order.createdAt), 'dd/MM/yyyy')}
                  </div>
                  {order.expectedDeliveryTime && (
                    <div className="text-sm text-muted-foreground flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      وقت التسليم المتوقع: {format(new Date(order.expectedDeliveryTime), 'dd/MM/yyyy')}
                    </div>
                  )}
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
                      
                      <div className="flex flex-col justify-between">
                        <div className="text-right">
                          <h3 className="font-medium mb-2">المجموع:</h3>
                          <div className={`text-xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                            ${order.total.toFixed(2)}
                          </div>
                        </div>
                        
                        <div className="mt-4 text-right">
                          <Link to={`/orders/${order.id}`}>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className={`${
                                theme === 'dark' 
                                  ? 'border-blue-600 text-blue-400 hover:bg-blue-900/30' 
                                  : 'border-blue-600 text-blue-600 hover:bg-blue-50'
                              }`}
                            >
                              عرض التفاصيل
                              <ArrowRight className="h-4 w-4 mr-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <ShoppingBag className={`h-16 w-16 mx-auto mb-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
            <h2 className="text-2xl font-medium mb-4">لا توجد طلبات</h2>
            <p className="text-muted-foreground mb-8">لم تقم بإنشاء أي طلبات بعد</p>
            
            <Link to="/categories">
              <Button 
                className={`${
                  theme === 'dark' 
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:shadow-[0_0_20px_rgba(37,99,235,0.7)]' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } transition-all duration-300`}
              >
                تصفح المنتجات
              </Button>
            </Link>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default OrdersPage;