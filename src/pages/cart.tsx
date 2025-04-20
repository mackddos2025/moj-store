import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useThemeStore } from "@/lib/theme";
import { useCartStore } from "@/lib/stores/cart-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Minus, Plus, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { motion } from "framer-motion";

const CartPage = () => {
  const { theme } = useThemeStore();
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity < 1) return;
    updateQuantity(id, quantity);
  };

  const handleRemoveItem = (id: string) => {
    removeItem(id);
    toast({
      title: "تمت إزالة المنتج",
      description: "تم إزالة المنتج من سلة التسوق",
    });
  };

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "يرجى تسجيل الدخول",
        description: "يجب عليك تسجيل الدخول لإتمام عملية الشراء",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const orderItems = items.map(item => ({
        productId: item.id,
        quantity: item.quantity,
      }));
      
      const order = await api.createOrder(user.id, orderItems);
      
      clearCart();
      
      toast({
        title: "تم إنشاء الطلب بنجاح",
        description: `رقم الطلب: ${order.id}`,
      });
      
      navigate("/orders");
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إنشاء الطلب",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate discount for each item
  const getItemPrice = (item: typeof items[0]) => {
    if (!item.discounts || item.discounts.length === 0) return item.price;
    
    const sortedDiscounts = [...item.discounts].sort(
      (a, b) => b.minQuantity - a.minQuantity
    );
    
    const applicableDiscount = sortedDiscounts.find(
      discount => item.quantity >= discount.minQuantity
    );
    
    if (applicableDiscount) {
      return item.price * (1 - applicableDiscount.discountPercentage / 100);
    }
    
    return item.price;
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className={`text-3xl font-bold mb-8 text-center ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
          سلة التسوق
        </h1>
        
        {items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className={`border ${
                theme === 'dark' ? 'border-blue-800 bg-blue-950/30' : 'border-blue-200'
              }`}>
                <CardHeader>
                  <CardTitle className={theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}>
                    المنتجات ({items.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {items.map((item) => {
                      const itemPrice = getItemPrice(item);
                      const hasDiscount = itemPrice !== item.price;
                      
                      return (
                        <motion.div 
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className={`flex items-center p-4 rounded-lg ${
                            theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'
                          }`}
                        >
                          <div className="w-20 h-20 rounded overflow-hidden flex-shrink-0">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <div className="ml-4 flex-grow">
                            <h3 className="font-medium">{item.name}</h3>
                            
                            <div className="flex items-center mt-1">
                              {hasDiscount ? (
                                <>
                                  <span className={`font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                                    ${itemPrice.toFixed(2)}
                                  </span>
                                  <span className="text-sm line-through text-muted-foreground ml-2">
                                    ${item.price.toFixed(2)}
                                  </span>
                                </>
                              ) : (
                                <span className={`font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                                    ${item.price.toFixed(2)}
                                  </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center mr-4">
                            <div className={`flex items-center border rounded-md ${
                              theme === 'dark' ? 'border-blue-700' : 'border-blue-300'
                            }`}>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className={`text-lg ${
                                  theme === 'dark' ? 'hover:bg-blue-900/50' : 'hover:bg-blue-50'
                                }`}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                                className={`w-12 text-center border-0 focus:ring-0 ${
                                  theme === 'dark' ? 'bg-transparent' : 'bg-transparent'
                                }`}
                              />
                              
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className={`text-lg ${
                                  theme === 'dark' ? 'hover:bg-blue-900/50' : 'hover:bg-blue-50'
                                }`}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleRemoveItem(item.id)}
                              className={`ml-2 ${
                                theme === 'dark' ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-50 text-red-600'
                              }`}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
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
                    ملخص الطلب
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>عدد المنتجات:</span>
                      <span>{items.reduce((sum, item) => sum + item.quantity, 0)} قطعة</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between font-bold text-lg">
                      <span>المجموع:</span>
                      <span className={theme === 'dark' ? 'text-green-400' : 'text-green-600'}>
                        ${getTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button 
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className={`w-full ${
                      theme === 'dark' 
                        ? 'bg-pink-600 hover:bg-pink-700 shadow-[0_0_15px_rgba(219,39,119,0.5)] hover:shadow-[0_0_20px_rgba(219,39,119,0.7)]' 
                        : 'bg-pink-600 hover:bg-pink-700'
                    } transition-all duration-300`}
                  >
                    {isProcessing ? (
                      <>جاري إنشاء الطلب...</>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        إتمام الطلب
                      </>
                    )}
                  </Button>
                  
                  <Link to="/categories" className="w-full">
                    <Button 
                      variant="outline" 
                      className={`w-full ${
                        theme === 'dark' 
                          ? 'border-blue-600 text-blue-400 hover:bg-blue-900/30' 
                          : 'border-blue-600 text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      <ArrowRight className="h-5 w-5 mr-2" />
                      متابعة التسوق
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <ShoppingCart className={`h-16 w-16 mx-auto mb-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
            <h2 className="text-2xl font-medium mb-4">سلة التسوق فارغة</h2>
            <p className="text-muted-foreground mb-8">لم تقم بإضافة أي منتجات إلى سلة التسوق بعد</p>
            
            <Link to="/categories">
              <Button 
                size="lg"
                className={`${
                  theme === 'dark' 
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:shadow-[0_0_20px_rgba(37,99,235,0.7)]' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } transition-all duration-300`}
              >
                <ArrowRight className="h-5 w-5 mr-2" />
                تصفح المنتجات
              </Button>
            </Link>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CartPage;