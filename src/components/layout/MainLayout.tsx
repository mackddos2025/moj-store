import { useEffect } from "react";
import { useThemeStore } from "@/lib/theme";
import { MoonStar, ShoppingCart, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useCartStore } from "@/lib/stores/cart-store";
import { Badge } from "@/components/ui/badge";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useThemeStore();
  const { user } = useAuthStore();
  const { items, getItemCount } = useCartStore();
  const itemCount = getItemCount();

  // Apply theme class to document
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  return (
    <div className={`min-h-screen flex flex-col ${theme}`}>
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-primary' : 'text-primary'} transition-all duration-300`}>
              <span className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>Mobile</span>
              <span className={`${theme === 'dark' ? 'text-pink-400' : 'text-pink-600'}`}>Accessories</span>
            </h1>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link to="/cart" className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className={`rounded-full ${theme === 'dark' ? 'hover:bg-pink-950 hover:text-pink-400' : 'hover:bg-pink-100 hover:text-pink-600'} transition-all duration-300`}
              >
                <ShoppingCart className={`h-5 w-5 ${theme === 'dark' ? 'text-pink-400' : 'text-pink-600'}`} />
                {itemCount > 0 && (
                  <Badge 
                    className={`absolute -top-1 -right-1 ${
                      theme === 'dark' 
                        ? 'bg-pink-600 hover:bg-pink-700' 
                        : 'bg-pink-600 hover:bg-pink-700'
                    }`}
                  >
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </Link>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className={`rounded-full ${theme === 'dark' ? 'hover:bg-blue-950 hover:text-blue-400' : 'hover:bg-blue-100 hover:text-blue-600'} transition-all duration-300`}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <MoonStar className="h-5 w-5 text-blue-600" />
              )}
            </Button>
            
            {user ? (
              <div className="flex items-center gap-2">
                <Link to={user.role === 'admin' ? '/admin' : '/orders'}>
                  <Button 
                    variant="outline" 
                    className={`${theme === 'dark' ? 'border-blue-500 text-blue-400 hover:bg-blue-950' : 'border-blue-600 text-blue-600 hover:bg-blue-50'} transition-all duration-300`}
                  >
                    {user.role === 'admin' ? 'لوحة التحكم' : 'طلباتي'}
                  </Button>
                </Link>
                <Link to="/logout">
                  <Button 
                    variant="ghost"
                    className={`${theme === 'dark' ? 'text-pink-400 hover:bg-pink-950 hover:text-pink-300' : 'text-pink-600 hover:bg-pink-50 hover:text-pink-700'} transition-all duration-300`}
                  >
                    تسجيل الخروج
                  </Button>
                </Link>
              </div>
            ) : (
              <Link to="/login">
                <Button 
                  className={`${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} transition-all duration-300`}
                >
                  تسجيل الدخول
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        {children}
      </main>
      
      <footer className="border-t border-border bg-background py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} Mobile Accessories Wholesale. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}