import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Product } from "@/lib/db/models";
import { useThemeStore } from "@/lib/theme";
import { motion } from "framer-motion";
import { ChevronRight, Minus, Plus, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart-store";
import { useToast } from "@/hooks/use-toast";

const ProductPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const { theme } = useThemeStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      
      try {
        const data = await api.getProductById(productId);
        if (data) {
          setProduct(data);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProduct();
  }, [productId]);

  const handleQuantityChange = (value: number) => {
    if (value < 1) return;
    if (product && value > product.stock) return;
    setQuantity(value);
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image,
      discounts: product.discounts,
    });
    
    toast({
      title: "تمت الإضافة إلى السلة",
      description: `تمت إضافة ${quantity} قطعة من ${product.name} إلى سلة التسوق`,
    });
  };

  // Calculate applicable discount
  const getApplicableDiscount = () => {
    if (!product || !product.discounts || product.discounts.length === 0) return null;
    
    const sortedDiscounts = [...product.discounts].sort(
      (a, b) => b.minQuantity - a.minQuantity
    );
    
    return sortedDiscounts.find(discount => quantity >= discount.minQuantity) || null;
  };

  const applicableDiscount = product ? getApplicableDiscount() : null;
  const discountedPrice = applicableDiscount 
    ? product!.price * (1 - applicableDiscount.discountPercentage / 100) 
    : product?.price;

  if (!productId) {
    return <div>Product ID is missing</div>;
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        {isLoading ? (
          <div className="flex flex-col md:flex-row gap-8 animate-pulse">
            <div className={`w-full md:w-1/2 h-96 rounded-lg ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'}`}></div>
            <div className="w-full md:w-1/2 space-y-4">
              <div className={`h-10 w-3/4 rounded ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'}`}></div>
              <div className={`h-6 w-1/4 rounded ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'}`}></div>
              <div className={`h-24 w-full rounded ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'}`}></div>
              <div className={`h-12 w-1/3 rounded ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'}`}></div>
            </div>
          </div>
        ) : product ? (
          <>
            <div className="flex items-center mb-8">
              <Link to="/categories" className={`text-sm ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} hover:underline`}>
                الفئات
              </Link>
              <ChevronRight className="mx-2 h-4 w-4" />
              <span className="font-medium">{product.name}</span>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8">
              <motion.div 
                className="w-full md:w-1/2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className={`overflow-hidden border ${
                  theme === 'dark' 
                    ? 'border-blue-800 bg-blue-900/20' 
                    : 'border-blue-200'
                }`}>
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-auto object-cover"
                  />
                </Card>
              </motion.div>
              
              <motion.div 
                className="w-full md:w-1/2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                  {product.name}
                </h1>
                
                <div className="flex items-center mb-4">
                  {applicableDiscount ? (
                    <>
                      <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                        ${discountedPrice?.toFixed(2)}
                      </span>
                      <span className="text-lg line-through text-muted-foreground ml-2">
                        ${product.price.toFixed(2)}
                      </span>
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        theme === 'dark' 
                          ? 'bg-pink-900/50 text-pink-300' 
                          : 'bg-pink-100 text-pink-700'
                      }`}>
                        خصم {applicableDiscount.discountPercentage}%
                      </span>
                    </>
                  ) : (
                    <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                      ${product.price.toFixed(2)}
                    </span>
                  )}
                </div>
                
                <p className="text-muted-foreground mb-6">
                  {product.description}
                </p>
                
                <div className="mb-6">
                  <p className={`mb-2 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                    المخزون المتاح: <span className="font-bold">{product.stock}</span> قطعة
                  </p>
                  
                  {product.discounts && product.discounts.length > 0 && (
                    <div className="mt-4">
                      <p className={`font-medium mb-2 ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-600'}`}>
                        خصومات الكمية:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {product.discounts
                          .sort((a, b) => a.minQuantity - b.minQuantity)
                          .map((discount, index) => (
                            <span 
                              key={index} 
                              className={`px-3 py-1 rounded-full text-sm ${
                                quantity >= discount.minQuantity
                                  ? theme === 'dark'
                                    ? 'bg-yellow-500/30 text-yellow-200 border border-yellow-500'
                                    : 'bg-yellow-200 text-yellow-800 border border-yellow-400'
                                  : theme === 'dark'
                                    ? 'bg-yellow-900/30 text-yellow-400'
                                    : 'bg-yellow-50 text-yellow-700'
                              } transition-colors duration-300`}
                            >
                              {discount.minQuantity}+ قطعة: خصم {discount.discountPercentage}%
                            </span>
                          ))
                        }
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center mb-6">
                  <span className="mr-4">الكمية:</span>
                  <div className={`flex items-center border rounded-md ${
                    theme === 'dark' ? 'border-blue-700' : 'border-blue-300'
                  }`}>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className={`text-lg ${
                        theme === 'dark' ? 'hover:bg-blue-900/50' : 'hover:bg-blue-50'
                      }`}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    
                    <input
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      className={`w-16 text-center border-0 focus:ring-0 ${
                        theme === 'dark' ? 'bg-transparent' : 'bg-transparent'
                      }`}
                    />
                    
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.stock}
                      className={`text-lg ${
                        theme === 'dark' ? 'hover:bg-blue-900/50' : 'hover:bg-blue-50'
                      }`}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Button 
                    onClick={handleAddToCart}
                    className={`px-8 ${
                      theme === 'dark' 
                        ? 'bg-pink-600 hover:bg-pink-700 shadow-[0_0_15px_rgba(219,39,119,0.5)] hover:shadow-[0_0_20px_rgba(219,39,119,0.7)]' 
                        : 'bg-pink-600 hover:bg-pink-700'
                    } transition-all duration-300`}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    أضف إلى السلة
                  </Button>
                  
                  {applicableDiscount && (
                    <div className={`ml-4 text-sm ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                      المجموع: ${(discountedPrice! * quantity).toFixed(2)}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">المنتج غير موجود</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ProductPage;