import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // التحقق من وجود عناصر في السلة
  const isCartEmpty = cart.length === 0;

  // معالجة إتمام الطلب
  const handleCheckout = () => {
    setIsCheckingOut(true);
    
    // محاكاة عملية الدفع
    setTimeout(() => {
      setIsCheckingOut(false);
      setCheckoutSuccess(true);
      clearCart();
      
      // إعادة تعيين رسالة النجاح بعد فترة
      setTimeout(() => {
        setCheckoutSuccess(false);
      }, 5000);
    }, 2000);
  };

  // إذا تم إتمام الطلب بنجاح
  if (checkoutSuccess) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-green-50 dark:bg-green-900/20 p-8 rounded-lg max-w-md mx-auto">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">تم إتمام الطلب بنجاح!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            شكراً لك على طلبك. سيتم شحن طلبك في أقرب وقت ممكن.
          </p>
          <Link 
            to="/products" 
            className="inline-flex items-center bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            مواصلة التسوق
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-200">سلة التسوق</h1>
      
      {isCartEmpty ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">سلة التسوق فارغة</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            لم تقم بإضافة أي منتجات إلى سلة التسوق بعد.
          </p>
          <Link 
            to="/products" 
            className="inline-flex items-center bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <ArrowRight className="mr-2 h-5 w-5" />
            تصفح المنتجات
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* قائمة المنتجات */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      المنتج
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      السعر
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      الكمية
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      المجموع
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      إجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {cart.map(item => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-16 w-16 flex-shrink-0">
                            <img 
                              src={item.image} 
                              alt={item.title} 
                              className="h-full w-full object-contain"
                            />
                          </div>
                          <div className="mr-4">
                            <Link 
                              to={`/products/${item.id}`}
                              className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-primary line-clamp-1"
                            >
                              {item.title}
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg w-min">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-3 py-1 text-gray-800 dark:text-gray-200">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        ${(item.price * item.quantity).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* ملخص الطلب */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">ملخص الطلب</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>المجموع الفرعي:</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>الشحن:</span>
                  <span>مجاناً</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between font-bold text-gray-900 dark:text-gray-100">
                  <span>المجموع:</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
              </div>
              
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className={`w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-medium transition-colors ${
                  isCheckingOut ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isCheckingOut ? 'جاري إتمام الطلب...' : 'إتمام الطلب'}
              </button>
              
              <div className="mt-6">
                <Link 
                  to="/products" 
                  className="text-primary hover:underline flex items-center justify-center"
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  مواصلة التسوق
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;