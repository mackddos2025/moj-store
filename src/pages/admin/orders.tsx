import { useState, useEffect } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useThemeStore } from "@/lib/theme";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Order } from "@/lib/db/models";
import { format } from "date-fns";
import { Loader2, Clock, Package, ShoppingBag, Truck, FileText, Send, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const AdminOrders = () => {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get("status") || "all");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Order update state
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderStatus, setOrderStatus] = useState<Order['status']>("pending");
  const [expectedDeliveryTime, setExpectedDeliveryTime] = useState("");
  
  // Notification state
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await api.getOrders();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء جلب الطلبات",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
  }, [toast]);
  
  const openUpdateDialog = (order: Order) => {
    setSelectedOrder(order);
    setOrderStatus(order.status);
    setExpectedDeliveryTime(order.expectedDeliveryTime || "");
    setIsUpdateDialogOpen(true);
  };
  
  const openNotificationDialog = (order: Order) => {
    setSelectedOrder(order);
    setNotificationMessage("");
    setIsNotificationDialogOpen(true);
  };
  
  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOrder) return;
    
    setIsSubmitting(true);
    
    try {
      const updatedOrder = await api.updateOrderStatus(
        selectedOrder.id,
        orderStatus,
        expectedDeliveryTime || undefined
      );
      
      setOrders(prev => 
        prev.map(o => o.id === updatedOrder.id ? updatedOrder : o)
      );
      
      toast({
        title: "تم التحديث",
        description: `تم تحديث حالة الطلب #${updatedOrder.id.substring(updatedOrder.id.length - 6)} بنجاح`,
      });
      
      // Send notification to customer about order status update
      if (selectedOrder.userId) {
        await api.sendTelegramNotification(
          selectedOrder.userId,
          `تم تحديث حالة طلبك #${selectedOrder.id.substring(selectedOrder.id.length - 6)} إلى ${getStatusText(orderStatus)}`
        );
      }
      
      setIsUpdateDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء تحديث الطلب",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOrder || !notificationMessage) return;
    
    setIsSubmitting(true);
    
    try {
      const success = await api.sendTelegramNotification(
        selectedOrder.userId,
        notificationMessage
      );
      
      if (success) {
        toast({
          title: "تم الإرسال",
          description: `تم إرسال الإشعار للعميل بنجاح`,
        });
      } else {
        throw new Error("فشل إرسال الإشعار. تأكد من وجود معرف تيليجرام للعميل.");
      }
      
      setIsNotificationDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إرسال الإشعار",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
  
  const filteredOrders = orders.filter(order => {
    // Filter by status
    if (activeTab !== "all" && order.status !== activeTab) {
      return false;
    }
    
    // Filter by search term (order ID)
    if (searchTerm && !order.id.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  const exportOrderToPDF = (order: Order) => {
    // In a real app, this would generate a PDF
    // For now, we'll just show a toast
    toast({
      title: "تصدير PDF",
      description: `تم تصدير الطلب #${order.id.substring(order.id.length - 6)} كملف PDF`,
    });
  };
  
  // Redirect if not admin
  if (user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className={`text-3xl font-bold mb-8 text-center ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
          إدارة الطلبات
        </h1>
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="w-full md:w-1/2">
            <Input
              placeholder="ابحث برقم الطلب..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${
                theme === 'dark' 
                  ? 'bg-blue-900/30 border-blue-700 focus:border-blue-500 focus:ring-blue-500/50' 
                  : 'bg-white border-blue-200 focus:border-blue-400'
              } text-right`}
            />
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="w-full overflow-x-auto flex-nowrap">
            <TabsTrigger value="all" className="flex-shrink-0">جميع الطلبات</TabsTrigger>
            <TabsTrigger value="pending" className="flex-shrink-0">بانتظار المراجعة</TabsTrigger>
            <TabsTrigger value="approved" className="flex-shrink-0">تمت الموافقة</TabsTrigger>
            <TabsTrigger value="shipping" className="flex-shrink-0">قيد التوصيل</TabsTrigger>
            <TabsTrigger value="delivered" className="flex-shrink-0">تم التسليم</TabsTrigger>
            <TabsTrigger value="cancelled" className="flex-shrink-0">تم الإلغاء</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
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
                        
                        <div className="mt-4 flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openUpdateDialog(order)}
                            className={`${
                              theme === 'dark' 
                                ? 'border-blue-600 text-blue-400 hover:bg-blue-900/30' 
                                : 'border-blue-600 text-blue-600 hover:bg-blue-50'
                            }`}
                          >
                            تحديث الحالة
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openNotificationDialog(order)}
                            className={`${
                              theme === 'dark' 
                                ? 'border-pink-600 text-pink-400 hover:bg-pink-900/30' 
                                : 'border-pink-600 text-pink-600 hover:bg-pink-50'
                            }`}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            إرسال إشعار
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => exportOrderToPDF(order)}
                            className={`${
                              theme === 'dark' 
                                ? 'border-green-600 text-green-400 hover:bg-green-900/30' 
                                : 'border-green-600 text-green-600 hover:bg-green-50'
                            }`}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ShoppingBag className={`h-16 w-16 mx-auto mb-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
            <h2 className="text-2xl font-medium mb-2">لا توجد طلبات</h2>
            <p className="text-muted-foreground mb-6">
              {searchTerm ? 'لا توجد طلبات تطابق بحثك' : 'لا توجد طلبات في هذه الفئة'}
            </p>
          </div>
        )}
      </div>
      
      {/* Order Update Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className={`max-w-md ${theme === 'dark' ? 'bg-slate-900 border-blue-800' : 'bg-white'}`}>
          <DialogHeader>
            <DialogTitle className={theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}>
              تحديث حالة الطلب
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleUpdateOrder} className="space-y-6" dir="rtl">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderStatus" className="text-right block">حالة الطلب</Label>
                <Select
                  value={orderStatus}
                  onValueChange={(value) => setOrderStatus(value as Order['status'])}
                >
                  <SelectTrigger className={`${
                    theme === 'dark' 
                      ? 'bg-blue-900/30 border-blue-700 focus:border-blue-500 focus:ring-blue-500/50' 
                      : 'bg-white border-blue-200 focus:border-blue-400'
                  } text-right`}>
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">بانتظار المراجعة</SelectItem>
                    <SelectItem value="approved">تمت الموافقة</SelectItem>
                    <SelectItem value="shipping">قيد التوصيل</SelectItem>
                    <SelectItem value="delivered">تم التسليم</SelectItem>
                    <SelectItem value="cancelled">تم الإلغاء</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {(orderStatus === 'shipping' || orderStatus === 'approved') && (
                <div className="space-y-2">
                  <Label htmlFor="expectedDeliveryTime" className="text-right block">وقت التسليم المتوقع</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="expectedDeliveryTime"
                      type="date"
                      value={expectedDeliveryTime ? expectedDeliveryTime.split('T')[0] : ''}
                      onChange={(e) => setExpectedDeliveryTime(e.target.value ? `${e.target.value}T00:00:00Z` : '')}
                      className={`${
                        theme === 'dark' 
                          ? 'bg-blue-900/30 border-blue-700 focus:border-blue-500 focus:ring-blue-500/50' 
                          : 'bg-white border-blue-200 focus:border-blue-400'
                      } text-right pl-10`}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUpdateDialogOpen(false)}
                className={`${
                  theme === 'dark' 
                    ? 'border-blue-700 hover:bg-blue-900/30 text-blue-400' 
                    : 'border-blue-300 hover:bg-blue-50 text-blue-600'
                }`}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className={`${
                  theme === 'dark' 
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:shadow-[0_0_20px_rgba(37,99,235,0.7)]' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } transition-all duration-300`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري التحديث...
                  </>
                ) : (
                  'تحديث الحالة'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Notification Dialog */}
      <Dialog open={isNotificationDialogOpen} onOpenChange={setIsNotificationDialogOpen}>
        <DialogContent className={`max-w-md ${theme === 'dark' ? 'bg-slate-900 border-pink-800' : 'bg-white'}`}>
          <DialogHeader>
            <DialogTitle className={theme === 'dark' ? 'text-pink-300' : 'text-pink-700'}>
              إرسال إشعار للعميل
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSendNotification} className="space-y-6" dir="rtl">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notificationMessage" className="text-right block">نص الإشعار</Label>
                <Input
                  id="notificationMessage"
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  placeholder="أدخل نص الإشعار الذي سيتم إرساله للعميل"
                  className={`${
                    theme === 'dark' 
                      ? 'bg-blue-900/30 border-blue-700 focus:border-blue-500 focus:ring-blue-500/50' 
                      : 'bg-white border-blue-200 focus:border-blue-400'
                  } text-right`}
                />
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>سيتم إرسال الإشعار عبر تيليجرام إذا كان العميل قد قام بربط حسابه.</p>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNotificationDialogOpen(false)}
                className={`${
                  theme === 'dark' 
                    ? 'border-blue-700 hover:bg-blue-900/30 text-blue-400' 
                    : 'border-blue-300 hover:bg-blue-50 text-blue-600'
                }`}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !notificationMessage}
                className={`${
                  theme === 'dark' 
                    ? 'bg-pink-600 hover:bg-pink-700 shadow-[0_0_15px_rgba(219,39,119,0.5)] hover:shadow-[0_0_20px_rgba(219,39,119,0.7)]' 
                    : 'bg-pink-600 hover:bg-pink-700'
                } transition-all duration-300`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    إرسال الإشعار
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default AdminOrders;