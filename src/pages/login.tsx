import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { api } from "@/lib/api";
import { MainLayout } from "@/components/layout/MainLayout";
import { useThemeStore } from "@/lib/theme";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuthStore();
  const { theme } = useThemeStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    }

    if (!formData.password) {
      newErrors.password = "كلمة المرور مطلوبة";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const result = await api.login(formData.email, formData.password);
      
      if (!result) {
        throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      }
      
      login(result.user, result.token);
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `مرحباً ${result.user.name}!`,
      });
      
      // Redirect based on user role
      if (result.user.role === 'admin') {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء تسجيل الدخول",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto flex min-h-[80vh] items-center justify-center py-10">
        <Card className={`mx-auto w-full max-w-md border ${
          theme === 'dark' 
            ? 'border-blue-800 bg-blue-950/30 shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
            : 'border-blue-200 bg-blue-50/50'
        } transition-all duration-300`}>
          <CardHeader className="text-center">
            <CardTitle className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`}>
              تسجيل الدخول
            </CardTitle>
            <CardDescription className="text-lg">
              أدخل بيانات الدخول الخاصة بك
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit} dir="rtl">
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-right block">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`${
                    theme === 'dark' 
                      ? 'bg-blue-900/30 border-blue-700 focus:border-blue-500 focus:ring-blue-500/50' 
                      : 'bg-white border-blue-200 focus:border-blue-400'
                  } text-right`}
                />
                {errors.email && <p className="text-sm text-destructive text-right">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-right block">كلمة المرور</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`${
                    theme === 'dark' 
                      ? 'bg-blue-900/30 border-blue-700 focus:border-blue-500 focus:ring-blue-500/50' 
                      : 'bg-white border-blue-200 focus:border-blue-400'
                  } text-right`}
                />
                {errors.password && <p className="text-sm text-destructive text-right">{errors.password}</p>}
              </div>
            </CardContent>

            <CardFooter>
              <Button 
                type="submit" 
                className={`w-full ${
                  theme === 'dark'
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-[0_0_10px_rgba(37,99,235,0.5)] hover:shadow-[0_0_15px_rgba(37,99,235,0.8)]'
                    : 'bg-blue-600 hover:bg-blue-700'
                } transition-all duration-300`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  "تسجيل الدخول"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}