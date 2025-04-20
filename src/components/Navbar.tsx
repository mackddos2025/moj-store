import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { isAdmin } from '@/lib/auth';

export default function Navbar() {
  const navigate = useNavigate();
  const [isAdminUser, setIsAdminUser] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkAdminStatus = async () => {
      const adminStatus = await isAdmin();
      setIsAdminUser(adminStatus);
      setLoading(false);
    };

    checkAdminStatus();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth/login');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-800">
              متجر لطقية
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/products" className="text-gray-600 hover:text-gray-900">
              المنتجات
            </Link>
            <Link to="/categories" className="text-gray-600 hover:text-gray-900">
              التصنيفات
            </Link>
            <Link to="/cart" className="text-gray-600 hover:text-gray-900">
              السلة
            </Link>

            {!loading && isAdminUser && (
              <Link
                to="/admin"
                className="text-gray-600 hover:text-gray-900"
              >
                لوحة التحكم
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
} 