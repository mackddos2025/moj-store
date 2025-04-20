import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Minus, Plus, ShoppingCart, ArrowLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { fetchProductById } from '../lib/supabase';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  // جلب تفاصيل المنتج
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // جلب تفاصيل المنتج
        const productData = await fetchProductById(id);
        
        if (productData && productData.id) {
          setProduct(productData);
          
          // جلب المنتجات ذات الصلة (من نفس الفئة)
          if (productData?.category) {
            try {
              const relatedResponse = await fetch(`https://fakestoreapi.com/products/category/${encodeURIComponent(productData.category)}?limit=4`);
              if (relatedResponse.ok) {
                const relatedData = await relatedResponse.json();
                // استبعاد المنتج الحالي من القائمة
                setRelatedProducts(relatedData.filter(item => item.id !== productData.id).slice(0, 4));
              }
            } catch (error) {
              console.error('Error fetching related products:', error);
              setRelatedProducts([]);
            }
          }
        } else {
          setError('لم يتم العثور على المنتج');
        }
      } catch (error) {
        console.error('خطأ في جلب تفاصيل المنتج:', error);
        setError('حدث خطأ أثناء جلب تفاصيل المنتج. يرجى المحاولة مرة أخرى.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  // زيادة الكمية
  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  // إنقاص الكمية
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // إضافة المنتج إلى سلة التسوق
  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      // إعادة تعيين الكمية بعد الإضافة
      setQuantity(1);
      
      // إظهار رسالة تأكيد (يمكن استبدالها بمكون toast)
      alert('تمت إضافة المنتج إلى سلة التسوق');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg aspect-square"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-8"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <Link 
            to="/products" 
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            العودة إلى المنتجات
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">المنتج غير موجود</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">لم يتم العثور على المنتج المطلوب.</p>
        <Link 
          to="/products" 
          className="inline-flex items-center text-blue-600 hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          العودة إلى المنتجات
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      {/* رابط العودة */}
      <Link 
        to="/products" 
        className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        العودة إلى المنتجات
      </Link>
      
      {/* تفاصيل المنتج */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* صورة المنتج */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center justify-center">
          <img 
            src={product.image} 
            alt={product.title} 
            className="max-h-80 object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/300?text=صورة+غير+متوفرة';
            }}
          />
        </div>
        
        {/* معلومات المنتج */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">{product.title}</h1>
          
          {/* التقييم */}
          <div className="flex items-center mb-4">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={18} 
                  fill={i < Math.round(product.rating?.rate || 0) ? "currentColor" : "none"} 
                  className={i < Math.round(product.rating?.rate || 0) ? "" : "text-gray-300"}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
              ({product.rating?.count || 0} تقييم)
            </span>
          </div>
          
          {/* السعر */}
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            ${product.price}
          </div>
          
          {/* الوصف المختصر */}
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {product.description?.substring(0, 150)}...
          </p>
          
          {/* الفئة */}
          <div className="mb-6">
            <span className="text-sm text-gray-500 dark:text-gray-400">الفئة: </span>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {product.category}
            </span>
          </div>
          
          {/* اختيار الكمية */}
          <div className="flex items-center mb-6">
            <span className="text-gray-700 dark:text-gray-300 ml-4">الكمية:</span>
            <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg">
              <button 
                onClick={decrementQuantity}
                className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                disabled={quantity <= 1}
              >
                <Minus size={16} />
              </button>
              <span className="px-4 py-1 text-gray-800 dark:text-gray-200">{quantity}</span>
              <button 
                onClick={incrementQuantity}
                className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          
          {/* زر إضافة للسلة */}
          <button
            onClick={handleAddToCart}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <ShoppingCart size={18} />
            إضافة للسلة
          </button>
        </div>
      </div>
      
      {/* علامات التبويب للمعلومات الإضافية */}
      <div className="mb-12">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('description')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'description'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              الوصف
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              المواصفات
            </button>
          </nav>
        </div>
        
        <div className="py-6">
          {activeTab === 'description' && (
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-400">{product.description}</p>
            </div>
          )}
          
          {activeTab === 'details' && (
            <div className="prose dark:prose-invert max-w-none">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="py-3 text-sm font-medium text-gray-500 dark:text-gray-400">المنتج</td>
                    <td className="py-3 text-sm text-gray-900 dark:text-gray-100">{product.title}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-sm font-medium text-gray-500 dark:text-gray-400">الفئة</td>
                    <td className="py-3 text-sm text-gray-900 dark:text-gray-100">{product.category}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-sm font-medium text-gray-500 dark:text-gray-400">التقييم</td>
                    <td className="py-3 text-sm text-gray-900 dark:text-gray-100">{product.rating?.rate || 0} من 5</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-sm font-medium text-gray-500 dark:text-gray-400">عدد التقييمات</td>
                    <td className="py-3 text-sm text-gray-900 dark:text-gray-100">{product.rating?.count || 0}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* المنتجات ذات الصلة */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">منتجات ذات صلة</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map(relatedProduct => (
              <Link 
                to={`/products/${relatedProduct.id}`} 
                key={relatedProduct.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 group"
              >
                <div className="aspect-square overflow-hidden rounded-md mb-4">
                  <img 
                    src={relatedProduct.image} 
                    alt={relatedProduct.title} 
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/150?text=صورة+غير+متوفرة';
                    }}
                  />
                </div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2 line-clamp-1">{relatedProduct.title}</h3>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900 dark:text-gray-100">${relatedProduct.price}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;