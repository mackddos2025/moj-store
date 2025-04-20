import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Category {
  id: string;
  name: string;
  image: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category_id: string;
  category: {
    name: string;
  };
}

export default function HomePage() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*');

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // Fetch featured products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(name)
          `)
          .limit(8);

        if (productsError) throw productsError;
        setFeaturedProducts(productsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddToCart = async (product: Product) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Redirect to login if not authenticated
        window.location.href = '/auth/login';
        return;
      }

      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id: product.id,
          quantity: 1
        });

      if (error) throw error;
      
      // Show success message
      alert('تمت إضافة المنتج إلى السلة');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('حدث خطأ أثناء إضافة المنتج إلى السلة');
    }
  };

  return (
    <div className="w-full min-h-screen">
      {/* Hero Section */}
      <section className="py-12 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto text-center">
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-blue-700"
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
              <button 
                className="text-lg bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-300"
              >
                تصفح المنتجات
                <ArrowRight className="mr-2 h-5 w-5 inline-block" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
      
      {/* Marquee for Offers */}
      <div className="py-3 bg-pink-100 overflow-hidden">
        <div className="marquee-container">
          <div className="marquee-content">
            <span className="text-lg font-medium text-pink-600 px-4">
              🔥 عروض حصرية على شواحن سامسونج - خصم 15% عند شراء 50 قطعة أو أكثر!
            </span>
            <span className="text-lg font-medium text-pink-600 px-4">
              🎧 سماعات بلوتوث لاسلكية - خصم 20% على الكميات!
            </span>
            <span className="text-lg font-medium text-pink-600 px-4">
              📱 كفرات حماية لجميع الموديلات - اطلب الآن!
            </span>
            <span className="text-lg font-medium text-pink-600 px-4">
              🚚 توصيل مجاني للطلبات فوق 500 دولار!
            </span>
          </div>
        </div>
      </div>
      
      {/* Categories Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center text-blue-700">
            تصفح حسب الفئات
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array(3).fill(0).map((_, index) => (
                <div key={index} className="h-64 bg-blue-50 animate-pulse rounded-lg" />
              ))
            ) : (
              categories.map((category) => (
                <Link to={`/categories/${category.id}`} key={category.id}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="h-64 overflow-hidden border border-blue-200 rounded-lg hover:shadow-lg transition-all duration-300">
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
                    </div>
                  </motion.div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
      
      {/* Featured Products */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center text-blue-700">
            منتجات مميزة
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              Array(4).fill(0).map((_, index) => (
                <div key={index} className="h-80 bg-blue-50 animate-pulse rounded-lg" />
              ))
            ) : (
              featuredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="h-full overflow-hidden border border-blue-200 rounded-lg transition-all duration-300">
                    <div className="p-0 flex flex-col h-full">
                      <Link to={`/products/${product.id}`} className="block h-48 overflow-hidden">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                      </Link>
                      
                      <div className="p-4 flex flex-col flex-grow">
                        <Link to={`/products/${product.id}`} className="block mb-2">
                          <h3 className="font-bold text-lg text-blue-700">
                            {product.name}
                          </h3>
                        </Link>
                        
                        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                          {product.description}
                        </p>
                        
                        <div className="mt-auto flex items-center justify-between">
                          <span className="font-bold text-lg text-green-600">
                            ${product.price}
                          </span>
                          
                          <button 
                            onClick={() => handleAddToCart(product)}
                            className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md transition-all duration-300"
                          >
                            <ShoppingCart className="h-4 w-4 mr-1 inline-block" />
                            أضف للسلة
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
          
          <div className="mt-10 text-center">
            <Link to="/categories">
              <button 
                className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg transition-all duration-300"
              >
                عرض جميع المنتجات
                <ArrowRight className="mr-2 h-5 w-5 inline-block" />
              </button>
            </Link>
          </div>
        </div>
      </section>
      
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
    </div>
  );
} 