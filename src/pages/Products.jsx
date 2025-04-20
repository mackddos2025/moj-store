import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Search, Filter, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

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
  
  const { addToCart } = useCart();

  // جلب المنتجات والفئات
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://fakestoreapi.com/products');
        if (!response.ok) throw new Error('فشل في جلب البيانات');
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data);
        
        // استخراج الفئات الفريدة
        const uniqueCategories = [...new Set(data.map(product => product.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('خطأ في جلب المنتجات:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // تطبيق الفلاتر عند تغيير أي من معايير التصفية
  useEffect(() => {
    let result = [...products];
    
    // تطبيق فلتر البحث
    if (searchQuery) {
      result = result.filter(product => 
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
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
        result.sort((a, b) => b.rating.rate - a.rating.rate);
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
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-gray-200"
          />
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-gray-200"
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
              className="text-sm text-primary hover:underline flex items-center gap-1"
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
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-900 dark:text-gray-200"
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
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
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
                  className="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-primary hover:text-white transition-colors dark:text-gray-200"
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