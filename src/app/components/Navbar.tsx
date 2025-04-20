import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User as UserIcon, Sun, Moon, LayoutDashboard, LogOut } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { User } from '@supabase/supabase-js';

interface UserWithRole extends User {
  role?: string;
}

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserWithRole | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setCurrentUser(null);
        setIsAdmin(false);
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      setCurrentUser({ ...user, role: data.role });
      setIsAdmin(data.role === 'admin');
    } catch (error) {
      console.error('Error checking user status:', error);
      setCurrentUser(null);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setCurrentUser(null);
      setIsAdmin(false);
      navigate('/auth/login');
      toast.success('تم تسجيل الخروج بنجاح');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('حدث خطأ أثناء تسجيل الخروج');
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md transition-colors duration-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            متجر بحر
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link to="/products" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              المنتجات
            </Link>
            <Link to="/categories" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              الفئات
            </Link>
            <Link to="/cart" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <ShoppingCart className="h-6 w-6" />
            </Link>
            
            {!isLoading && (
              <>
                {currentUser ? (
                  <div className="flex items-center space-x-4">
                    {isAdmin && (
                      <Link 
                        to="/admin/dashboard" 
                        className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="لوحة التحكم"
                      >
                        <LayoutDashboard className="h-6 w-6" />
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <LogOut className="h-6 w-6" />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                ) : (
                  <Link to="/auth/login" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <UserIcon className="h-6 w-6" />
                  </Link>
                )}
              </>
            )}
            
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
} 