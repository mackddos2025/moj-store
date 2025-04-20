import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Product, Subcategory } from "@/lib/db/models";
import { useThemeStore } from "@/lib/theme";
import { motion } from "framer-motion";
import { ChevronRight, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart-store";
import { useToast } from "@/hooks/use-toast";

const SubcategoryPage = () => {
  const { subcategoryId } = useParams<{ subcategoryId: string }>();
  const { theme } = useThemeStore();
  const [subcategory, setSubcategory] = useState<Subcategory | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem } = useCartStore();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!subcategoryId) return;
      
      try {
        const [subcategoryData, productsData] = await Promise.all([
          api.getSubcategoryById(subcategoryId),
          api.getProductsBySubcategoryId(subcategoryId),
        ]);
        
        if (subcategoryData) {
          setSubcategory(subcategoryData);
        }
        
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [subcategoryId]);

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      discounts: product.discounts,
    });
    
    toast({
      title: "تمت الإضافة إلى السلة",
      description: `تمت إضافة ${product.name} إلى سلة التسوق`,
    });
  };

  if (!subcategoryId) {
    return <div>Subcategory ID is missing</div>;
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="flex items-center mb-8">
          <Link to="/categories" className={`text-sm ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} hover:underline`}>
            الفئات
          </Link>
          {subcategory && (
            <>
              <ChevronRight className="mx-2 h-4 w-4" />
              <Link 
                to={`/categories/${subcategory.categoryId}`} 
                className={`text-sm ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
              >
                الفئة
              </Link>
            </>
          )}
          <ChevronRight className="mx-2 h-4 w-4" />
          <span className="font-medium">{isLoading ? 'جاري التحميل...' : subcategory?.name}</span>
        </div>
        
        <h1 className={`text-3xl font-bold mb-8 text-center ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
          {isLoading ? 'جاري التحميل...' : subcategory?.name}
        </h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array(8).fill(0).map((_, index) => (
              <Card key={index} className={`h-80 ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'} animate-pulse`} />
            ))
          ) : products.length > 0 ? (
            products.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ 
                  scale: 1.03,
                  boxShadow: theme === 'dark' 
                    ? '0 0 20px rgba(59, 130, 246, 0.5)' 
                    : '0 10px 25px rgba(0, 0, 0, 0.1)' 
                }}
                transition={{ duration: 0.2 }}
              >
                <Card className={`h-full overflow-hidden border ${
                  theme === 'dark' 
                    ? 'border-blue-800 bg-blue-900/20' 
                    : 'border-blue-200'
                } transition-all duration-300`}>
                  <CardContent className="p-0 flex flex-col h-full">
                    <Link to={`/products/${product.id}`} className="block h-48 overflow-hidden">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                    </Link>
                    
                    <div className="p-4 flex flex-col flex-grow">
                      <Link to={`/products/${product.id}`} className="block mb-2">
                        <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                          {product.name}
                        </h3>
                      </Link>
                      
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      
                      <div className="mt-auto flex items-center justify-between">
                        <span className={`font-bold text-lg ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                          ${product.price}
                        </span>
                        
                        <Button 
                          size="sm" 
                          onClick={() => handleAddToCart(product)}
                          className={`${
                            theme === 'dark' 
                              ? 'bg-pink-600 hover:bg-pink-700 shadow-[0_0_10px_rgba(219,39,119,0.5)] hover:shadow-[0_0_15px_rgba(219,39,119,0.7)]' 
                              : 'bg-pink-600 hover:bg-pink-700'
                          } transition-all duration-300`}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          أضف للسلة
                        </Button>
                      </div>
                      
                      {product.discounts && product.discounts.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className={`text-xs ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-600'}`}>
                            خصومات الكمية:
                          </p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {product.discounts
                              .sort((a, b) => a.minQuantity - b.minQuantity)
                              .map((discount, index) => (
                                <span 
                                  key={index} 
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    theme === 'dark' 
                                      ? 'bg-yellow-900/50 text-yellow-300' 
                                      : 'bg-yellow-100 text-yellow-700'
                                  }`}
                                >
                                  {discount.minQuantity}+ قطعة: خصم {discount.discountPercentage}%
                                </span>
                              ))
                            }
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-xl text-muted-foreground">لا توجد منتجات في هذا القسم</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SubcategoryPage;