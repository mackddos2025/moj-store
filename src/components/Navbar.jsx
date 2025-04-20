import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, Sun, Moon, Menu, X } from 'lucide-react';

const Navbar = ({ darkMode, toggleDarkMode }) => {
  const { getCartItemsCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // تتبع التمرير لتغيير مظهر شريط التنقل
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white shadow-md dark:bg-gray-900' 
        : 'bg-white dark:bg-gray-900'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* الشعار */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary dark:text-primary-foreground">MOJ Store</span>
          </Link>

          {/* قائمة التنقل للشاشات الكبيرة */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary dark:text-gray-200 dark:hover:text-primary-foreground">
              الرئيسية
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-primary dark:text-gray-200 dark:hover:text-primary-foreground">
              المنتجات
            </Link>
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex items-center space-x-4">
            {/* زر تبديل الوضع المظلم */}
            <button 
              onClick={toggleDarkMode} 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label={darkMode ? "تفعيل الوضع المضيء" : "تفعيل الوضع المظلم"}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {/* زر سلة التسوق */}
            <Link to="/cart" className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
              <ShoppingCart size={20} />
              {getCartItemsCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getCartItemsCount()}
                </span>
              )}
            </Link>
            
            {/* زر القائمة للشاشات الصغيرة */}
            <button 
              className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={toggleMenu}
              aria-label="قائمة"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* قائمة التنقل للشاشات الصغيرة */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-primary dark:text-gray-200 dark:hover:text-primary-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                الرئيسية
              </Link>
              <Link 
                to="/products" 
                className="text-gray-700 hover:text-primary dark:text-gray-200 dark:hover:text-primary-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                المنتجات
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;