import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useThemeStore } from "@/lib/theme";
import { useAuthStore } from "@/lib/stores/auth-store";
import { api } from "@/lib/api";
import { Order, Product } from "@/lib/db/models";
import { Users, Package, ShoppingBag, TrendingUp, DollarSign, BarChart2, Loader2, LineChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const AdminDashboard = () => {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profitData, setProfitData] = useState<{ date: string; profit: number }[]>([]);
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [ordersData, productsData] = await Promise.all([
          api.getOrders(),
          api.getProducts(),
        ]);
        
        setOrders(ordersData);
        setProducts(productsData);
        
        // Calculate profit data
        const profitByDate = ordersData.reduce((acc, order) => {
          const date = new Date(order.createdAt).toLocaleDateString();
          const orderProfit = order.items.reduce((total, item) => {
            const product = productsData.find(p => p.id === item.productId);
            if (!product) return total;
            return total + (item.price - product.cost) * item.quantity;
          }, 0);
          
          if (!acc[date]) {
            acc[date] = 0;
          }
          acc[date] += orderProfit;
          return acc;
        }, {} as Record<string, number>);
        
        const profitChartData = Object.entries(profitByDate)
          .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
          .map(([date, profit]) => ({
            date,
            profit,
          }));
        
        setProfitData(profitChartData);
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
        setError(error.message || "حدث خطأ أثناء تحميل البيانات");
        toast({
          title: "خطأ",
          description: error.message || "حدث خطأ أثناء تحميل البيانات",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalCost = orders.reduce((sum, order) => {
    return sum + order.items.reduce((itemSum, item) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return itemSum;
      return itemSum + product.cost * item.quantity;
    }, 0);
  }, 0);
  const totalProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  // Redirect if not admin
  if (user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-muted-foreground">جاري تحميل البيانات...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <p className="text-destructive mb-4">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              إعادة المحاولة
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className={`text-3xl font-bold mb-8 text-center ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
          لوحة التحكم
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className={`border ${
            theme === 'dark' ? 'border-blue-800 bg-blue-950/30' : 'border-blue-200'
          }`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                إجمالي المبيعات
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRevenue.toLocaleString()} ل.س</div>
            </CardContent>
          </Card>
          
          <Card className={`border ${
            theme === 'dark' ? 'border-blue-800 bg-blue-950/30' : 'border-blue-200'
          }`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                إجمالي التكلفة
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCost.toLocaleString()} ل.س</div>
            </CardContent>
          </Card>
          
          <Card className={`border ${
            theme === 'dark' ? 'border-blue-800 bg-blue-950/30' : 'border-blue-200'
          }`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                إجمالي الأرباح
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProfit.toLocaleString()} ل.س</div>
            </CardContent>
          </Card>
          
          <Card className={`border ${
            theme === 'dark' ? 'border-blue-800 bg-blue-950/30' : 'border-blue-200'
          }`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                هامش الربح
              </CardTitle>
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profitMargin.toFixed(2)}%</div>
            </CardContent>
          </Card>
        </div>
        
        <Card className={`border mb-8 ${
          theme === 'dark' ? 'border-blue-800 bg-blue-950/30' : 'border-blue-200'
        }`}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className={theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}>
              تطور الأرباح
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChart(!showChart)}
              className={`${
                theme === 'dark' 
                  ? 'border-blue-700 hover:bg-blue-900/30' 
                  : 'border-blue-300 hover:bg-blue-50'
              }`}
            >
              {showChart ? (
                <>
                  <BarChart2 className="h-4 w-4 mr-2" />
                  عرض الجدول
                </>
              ) : (
                <>
                  <LineChart className="h-4 w-4 mr-2" />
                  عرض الرسم البياني
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            {profitData.length > 0 ? (
              showChart ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={profitData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => [`${value.toLocaleString()} ل.س`, 'الربح']}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="profit"
                        stroke={theme === 'dark' ? '#60a5fa' : '#2563eb'}
                        strokeWidth={2}
                        name="الربح"
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${theme === 'dark' ? 'border-blue-800' : 'border-blue-200'}`}>
                        <th className="py-2 px-4 text-right">التاريخ</th>
                        <th className="py-2 px-4 text-right">الربح</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profitData.map((data, index) => (
                        <tr 
                          key={data.date}
                          className={`${
                            index % 2 === 0
                              ? theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'
                              : ''
                          }`}
                        >
                          <td className="py-2 px-4">{data.date}</td>
                          <td className="py-2 px-4">{data.profit.toLocaleString()} ل.س</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">لا توجد بيانات للعرض</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className={`border ${
            theme === 'dark' ? 'border-blue-800 bg-blue-950/30' : 'border-blue-200'
          }`}>
            <CardHeader>
              <CardTitle className={theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}>
                إدارة المتجر
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to="/admin/users">
                <Button 
                  variant="outline" 
                  className={`w-full justify-start ${
                    theme === 'dark' 
                      ? 'border-blue-700 hover:bg-blue-900/30' 
                      : 'border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <Users className="h-5 w-5 mr-2" />
                  إدارة المستخدمين
                </Button>
              </Link>
              
              <Link to="/admin/categories">
                <Button 
                  variant="outline" 
                  className={`w-full justify-start ${
                    theme === 'dark' 
                      ? 'border-blue-700 hover:bg-blue-900/30' 
                      : 'border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <Package className="h-5 w-5 mr-2" />
                  إدارة الفئات والأقسام
                </Button>
              </Link>
              
              <Link to="/admin/products">
                <Button 
                  variant="outline" 
                  className={`w-full justify-start ${
                    theme === 'dark' 
                      ? 'border-blue-700 hover:bg-blue-900/30' 
                      : 'border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <Package className="h-5 w-5 mr-2" />
                  إدارة المنتجات
                </Button>
              </Link>
              
              <Link to="/admin/orders">
                <Button 
                  variant="outline" 
                  className={`w-full justify-start ${
                    theme === 'dark' 
                      ? 'border-blue-700 hover:bg-blue-900/30' 
                      : 'border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  إدارة الطلبات
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card className={`border ${
            theme === 'dark' ? 'border-blue-800 bg-blue-950/30' : 'border-blue-200'
          }`}>
            <CardHeader>
              <CardTitle className={theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}>
                آخر الطلبات
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div 
                      key={order.id} 
                      className={`p-4 rounded-lg ${
                        theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">طلب #{order.id.substring(order.id.length - 6)}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.total.toLocaleString()} ل.س
                          </p>
                        </div>
                        <div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            theme === 'dark' ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">لا توجد طلبات</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;