import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* معلومات المتجر */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">MOJ Store</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              متجر إلكتروني متخصص في بيع أحدث المنتجات التقنية والإلكترونية بأفضل الأسعار.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-foreground">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-foreground">
                <Twitter size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-foreground">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* روابط سريعة */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-foreground">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-foreground">
                  المنتجات
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-foreground">
                  سلة التسوق
                </Link>
              </li>
            </ul>
          </div>

          {/* معلومات الاتصال */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">اتصل بنا</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <MapPin size={18} className="text-primary dark:text-primary-foreground" />
                <span className="text-gray-600 dark:text-gray-400">الرياض، المملكة العربية السعودية</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone size={18} className="text-primary dark:text-primary-foreground" />
                <span className="text-gray-600 dark:text-gray-400">+966 123 456 789</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail size={18} className="text-primary dark:text-primary-foreground" />
                <span className="text-gray-600 dark:text-gray-400">info@mojstore.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* حقوق النشر */}
        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            &copy; {currentYear} MOJ Store. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;