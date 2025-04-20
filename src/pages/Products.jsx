import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Search, Filter, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { fetchProductsFromDB, fetchCategories } from '../lib/supabase';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [sortBy, setSortBy] = useState('default');
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState(null);
  
  const { addToCart } = useCart();

  // جلب المنتجات والفئات
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // جلب المنتجات
        const productsData = await fetchProductsFromDB();
        setProducts(productsData);
        setFilteredProducts(productsData);
        
        // جلب الفئات
        const categoriesData = await fetchCategories();
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        
      } catch (error) {
        console.error('خطأ في جلب البيانات:', error);
        setError('حدث خطأ أثناء جلب البيانات. يرجى المحاولة مرة أخرى.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // تطبيق الفلاتر عند تغيير أي من معايير التصفية
  useEffect(() => {
    if (!products || products.length === 0) return;
    
    let result = [...products];
    
    // تطبيق فلتر البحث
    if (searchQuery) {
      result = result.filter(product => 
        product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // تطبيق فلتر الفئة
    if (selectedCategory) {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    // تطبيق فلتر السعر
    result = result.filter(product => 
      product.price >= priceRange.min && product.price <= priceRange.max
    );
    
    // تطبيق الترتيب
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0));
        break;
      default:
        // الترتيب الافتراضي
        break;
    }
    
    setFilteredProducts(result);
  }, [products, searchQuery, selectedCategory, priceRange, sortBy]);

  // إعادة تعيين جميع الفلاتر
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setPriceRange({ min: 0, max: 1000 });
    setSortBy('default');
  };

  // إضافة منتج إلى سلة التسوق مع تأثير بصري
  const handleAddToCart = (product, event) => {
    event.preventDefault();
    event.stopPropagation();
    
    addToCart(product, 1);
    
    // إظهار تأثير بصري للإضافة
    const button = event.currentTarget;
    button.classList.add('bg-green-500', 'text-white');
    button.innerText = 'تمت الإضافة ✓';
    
    setTimeout(() => {
      button.classList.remove('bg-green-500', 'text-white');
      button.innerText = 'إضافة للسلة';
    }, 1500);
  };

  // عرض رسالة الخطأ إذا كان هناك خطأ
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-lg max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">حدث خطأ</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-200">منتجاتنا</h1>
      
      {/* شريط البحث والفلترة */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="ابحث عن منتج..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-200"
          />
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-200"
          >
            <option value="default">الترتيب الافتراضي</option>
            <option value="price-asc">السعر: من الأقل للأعلى</option>
            <option value="price-desc">السعر: من الأعلى للأقل</option>
            <option value="rating">التقييم</option>
          </select>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200"
          >
            <Filter size={18} />
            <span className="hidden md:inline">الفلاتر</span>
          </button>
        </div>
      </div>
      
      {/* قسم الفلاتر */}
      {showFilters && (
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">الفلاتر</h3>
            <button
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              <X size={14} />
              إعادة تعيين
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* فلتر الفئات */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الفئة</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-gray-200"
              >
                <option value="">جميع الفئات</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            {/* فلتر نطاق السعر */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                نطاق السعر: ${priceRange.min} - ${priceRange.max}
              </label>
              <div className="flex gap-4">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                  className="w-full"
                />
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* عرض المنتجات */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 animate-pulse h-80"></div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">لا توجد منتجات</h3>
          <p className="text-gray-500 dark:text-gray-400">لم يتم العثور على منتجات تطابق معايير البحث الخاصة بك.</p>
          <button
            onClick={resetFilters}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            إعادة تعيين الفلاتر
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <Link 
              to={`/products/${product.id}`} 
              key={product.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 group relative"
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
                <button
                  onClick={(e) => handleAddToCart(product, e)}
                  className="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-blue-600 hover:text-white transition-colors dark:text-gray-200"
                >
                  إضافة للسلة
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;