import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Category, Product } from "@/lib/db/models";
import { useThemeStore } from "@/lib/theme";
import { motion } from "framer-motion";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart-store";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { theme } = useThemeStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem } = useCartStore();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, productsData] = await Promise.all([
          api.getCategories(),
          api.getFeaturedProducts(),
        ]);
        
        setCategories(categoriesData);
        setFeaturedProducts(productsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

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

  return (
    <MainLayout>
      <div className="w-full min-h-screen">
        {/* Hero Section */}
        <section className={`py-12 px-4 ${theme === 'dark' ? 'bg-gradient-to-b from-blue-950 to-slate-900' : 'bg-gradient-to-b from-blue-50 to-white'}`}>
          <div className="container mx-auto text-center">
            <motion.h1 
              className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              متجر إكسسوارات الهواتف بالجملة
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl mb-8 text-muted-foreground"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              أفضل الإكسسوارات بأسعار الجملة لأصحاب المحلات
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link to="/categories">
                <Button 
                  size="lg" 
                  className={`text-lg ${
                    theme === 'dark' 
                      ? 'bg-blue-600 hover:bg-blue-700 shadow-[0_0_15px_rgba(37,99,235,0.6)] hover:shadow-[0_0_20px_rgba(37,99,235,0.8)]' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } transition-all duration-300`}
                >
                  تصفح المنتجات
                  <ArrowRight className="mr-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
        
        {/* Marquee for Offers */}
        <div className={`py-3 ${theme === 'dark' ? 'bg-pink-900/30' : 'bg-pink-100'} overflow-hidden`}>
          <div className="marquee-container">
            <div className="marquee-content">
              <span className={`text-lg font-medium ${theme === 'dark' ? 'text-pink-300' : 'text-pink-600'} px-4`}>
                🔥 عروض حصرية على شواحن سامسونج - خصم 15% عند شراء 50 قطعة أو أكثر!
              </span>
              <span className={`text-lg font-medium ${theme === 'dark' ? 'text-pink-300' : 'text-pink-600'} px-4`}>
                🎧 سماعات بلوتوث لاسلكية - خصم 20% على الكميات!
              </span>
              <span className={`text-lg font-medium ${theme === 'dark' ? 'text-pink-300' : 'text-pink-600'} px-4`}>
                📱 كفرات حماية لجميع الموديلات - اطلب الآن!
              </span>
              <span className={`text-lg font-medium ${theme === 'dark' ? 'text-pink-300' : 'text-pink-600'} px-4`}>
                🚚 توصيل مجاني للطلبات فوق 500 دولار!
              </span>
            </div>
          </div>
        </div>
        
        {/* Categories Section */}
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <h2 className={`text-3xl font-bold mb-8 text-center ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
              تصفح حسب الفئات
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                Array(3).fill(0).map((_, index) => (
                  <Card key={index} className={`h-64 ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'} animate-pulse`} />
                ))
              ) : (
                categories.map((category) => (
                  <Link to={`/categories/${category.id}`} key={category.id}>
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className={`h-64 overflow-hidden border ${
                        theme === 'dark' 
                          ? 'border-blue-800 bg-blue-900/20 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                          : 'border-blue-200 hover:shadow-lg'
                      } transition-all duration-300`}>
                        <div className="relative h-full">
                          <img 
                            src={category.image} 
                            alt={category.name} 
                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                            <h3 className="text-2xl font-bold text-white">{category.name}</h3>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>
        
        {/* Featured Products */}
        <section className={`py-12 px-4 ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'}`}>
          <div className="container mx-auto">
            <h2 className={`text-3xl font-bold mb-8 text-center ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
              منتجات مميزة
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {isLoading ? (
                Array(4).fill(0).map((_, index) => (
                  <Card key={index} className={`h-80 ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'} animate-pulse`} />
                ))
              ) : (
                featuredProducts.map((product) => (
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
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
            
            <div className="mt-10 text-center">
              <Link to="/categories">
                <Button 
                  variant="outline" 
                  size="lg"
                  className={`${
                    theme === 'dark' 
                      ? 'border-blue-600 text-blue-400 hover:bg-blue-900/30' 
                      : 'border-blue-600 text-blue-600 hover:bg-blue-50'
                  } transition-all duration-300`}
                >
                  عرض جميع المنتجات
                  <ArrowRight className="mr-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .marquee-container {
          width: 100%;
          overflow: hidden;
        }
        
        .marquee-content {
          display: inline-block;
          white-space: nowrap;
          animation: marquee 30s linear infinite;
        }
        
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}} />
    </MainLayout>
  );
};

export default Index;