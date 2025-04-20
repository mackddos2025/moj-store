import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import { fetchProductsFromDB } from '../lib/supabase';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // جلب المنتجات المميزة من واجهة برمجة التطبيقات
    const fetchFeaturedProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // جلب المنتجات
        const productsData = await fetchProductsFromDB();
        
        // اختيار 4 منتجات عشوائية كمنتجات مميزة
        const randomProducts = [...productsData]
          .sort(() => 0.5 - Math.random())
          .slice(0, 4);
          
        setFeaturedProducts(randomProducts);
      } catch (error) {
        console.error('خطأ في جلب المنتجات المميزة:', error);
        setError('حدث خطأ أثناء جلب المنتجات المميزة. يرجى المحاولة مرة أخرى.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="space-y-16">
      {/* قسم البانر الرئيسي */}
      <section className="relative bg-gradient-to-r from-primary to-primary-dark rounded-2xl overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="text-white space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold">أحدث المنتجات التقنية بأفضل الأسعار</h1>
              <p className="text-lg opacity-90">
                اكتشف مجموعتنا الواسعة من المنتجات عالية الجودة بأسعار تنافسية
              </p>
              <div className="pt-4">
                <Link 
                  to="/products" 
                  className="inline-flex items-center bg-white text-primary px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  تسوق الآن
                  <ArrowRight className="mr-2 h-5 w-5" />
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img 
                src="https://images.unsplash.com/photo-1661961110218-35af7210f803?q=80&w=2070" 
                alt="تسوق إلكتروني" 
                className="rounded-lg shadow-lg max-h-80 object-cover w-full"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/800x400?text=صورة+غير+متوفرة';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* قسم المنتجات المميزة */}
      <section>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200">منتجات مميزة</h2>
            <Link 
              to="/products" 
              className="text-primary hover:underline inline-flex items-center"
            >
              عرض الكل
              <ArrowRight className="mr-1 h-4 w-4" />
            </Link>
          </div>

          {error ? (
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg text-center">
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 animate-pulse h-64"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <Link 
                  to={`/products/${product.id}`} 
                  key={product.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 group"
                >
                  <div className="aspect-square overflow-hidden rounded-md mb-4">
                    <img 
                      src={product.image} 
                      alt={product.title} 
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/150?text=صورة+غير+متوفرة';
                      }}
                    />
                  </div>
                  <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2 line-clamp-1">{product.title}</h3>
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={16} 
                          fill={i < Math.round(product.rating?.rate || 0) ? "currentColor" : "none"} 
                          className={i < Math.round(product.rating?.rate || 0) ? "" : "text-gray-300"}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">
                      ({product.rating?.count || 0})
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900 dark:text-gray-100">${product.price}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* قسم المميزات */}
      <section className="bg-gray-50 dark:bg-gray-900 py-12 rounded-xl">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-200">لماذا تختار متجرنا؟</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">منتجات أصلية</h3>
              <p className="text-gray-600 dark:text-gray-400">نضمن أن جميع منتجاتنا أصلية 100% مع ضمان الجودة</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">توصيل سريع</h3>
              <p className="text-gray-600 dark:text-gray-400">نوفر خدمة توصيل سريعة لجميع الطلبات في أنحاء المملكة</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">دفع آمن</h3>
              <p className="text-gray-600 dark:text-gray-400">طرق دفع متعددة وآمنة لضمان حماية معلوماتك الشخصية</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;