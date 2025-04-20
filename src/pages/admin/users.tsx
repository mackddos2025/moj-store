import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useThemeStore } from "@/lib/theme";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { User } from "@/lib/stores/auth-store";
import { Loader2, Plus, UserPlus, Eye, EyeOff, Pencil, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AdminUsers = () => {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    telegramId: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editUser, setEditUser] = useState<{
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'user' | 'admin';
    telegramId?: string;
    password?: string;
  } | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // In a real app, we would fetch users from the API
        // For now, we'll use mock data
        setUsers([
          {
            id: "customer1",
            name: "Store Owner",
            email: "customer@example.com",
            phone: "+9876543210",
            role: "customer",
            telegramId: "@storeowner",
          },
          {
            id: "customer2",
            name: "Another Store",
            email: "another@example.com",
            phone: "+1234567890",
            role: "customer",
          },
        ]);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editingUser) {
      setEditingUser(prev => prev ? { ...prev, [name]: value } : null);
    } else {
      setNewUser((prev) => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (userData: typeof newUser) => {
    const newErrors: Record<string, string> = {};
    
    if (!userData.name) {
      newErrors.name = "الاسم مطلوب";
    }
    
    if (!userData.email) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      newErrors.email = "البريد الإلكتروني غير صالح";
    }
    
    if (!userData.phone) {
      newErrors.phone = "رقم الهاتف مطلوب";
    }

    if (!editingUser && !userData.password) {
      newErrors.password = "كلمة المرور مطلوبة";
    } else if (!editingUser && userData.password.length < 6) {
      newErrors.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(newUser)) return;
    
    setIsCreating(true);
    
    try {
      const newUserData = await api.createUser({
        ...newUser,
        role: "customer",
      });
      
      setUsers((prev) => [...prev, newUserData]);
      
      toast({
        title: "تم إنشاء المستخدم بنجاح",
        description: `تم إنشاء حساب للمستخدم ${newUserData.name}`,
      });
      
      // Reset form
      setNewUser({
        name: "",
        email: "",
        phone: "",
        telegramId: "",
        password: "",
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إنشاء المستخدم",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editUser) return;
    
    try {
      const updatedUser = await api.updateUser(editUser.id, {
        name: editUser.name,
        email: editUser.email,
        phone: editUser.phone,
        telegramId: editUser.telegramId || '',
        password: editUser.password || '',
      });
      
      setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
      toast({
        title: "تم تحديث المستخدم بنجاح",
        description: "تم تحديث بيانات المستخدم بنجاح",
      });
      
      setEditUser(null);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء تحديث المستخدم",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (user: User) => {
    setEditUser({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role as 'user' | 'admin',
      telegramId: user.telegramId,
    });
  };

  // Redirect if not admin
  if (user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className={`text-3xl font-bold mb-8 text-center ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
          إدارة المستخدمين
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className={`border ${
              theme === 'dark' ? 'border-blue-800 bg-blue-950/30' : 'border-blue-200'
            }`}>
              <CardHeader>
                <CardTitle className={theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}>
                  المستخدمين
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : users.length > 0 ? (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div 
                        key={user.id} 
                        className={`p-4 rounded-lg ${
                          theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-lg">{user.name}</h3>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <p className="text-sm text-muted-foreground">{user.phone}</p>
                            {user.telegramId && (
                              <p className="text-sm text-muted-foreground">
                                Telegram: {user.telegramId}
                              </p>
                            )}
                          </div>
                          <div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className={`${
                                theme === 'dark' 
                                  ? 'border-blue-700 hover:bg-blue-900/30' 
                                  : 'border-blue-300 hover:bg-blue-50'
                              }`}
                              onClick={() => handleEditClick(user)}
                            >
                              <Pencil className="h-4 w-4 mr-1" />
                              تعديل
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">لا يوجد مستخدمين</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className={`border ${
              theme === 'dark' ? 'border-blue-800 bg-blue-950/30' : 'border-blue-200'
            }`}>
              <CardHeader>
                <CardTitle className={theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}>
                  <div className="flex items-center">
                    <UserPlus className="h-5 w-5 mr-2" />
                    إضافة مستخدم جديد
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateUser} className="space-y-4" dir="rtl">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-right block">الاسم</Label>
                    <Input
                      id="name"
                      name="name"
                      value={newUser.name}
                      onChange={handleInputChange}
                      className={`${
                        theme === 'dark' 
                          ? 'bg-blue-900/30 border-blue-700 focus:border-blue-500 focus:ring-blue-500/50' 
                          : 'bg-white border-blue-200 focus:border-blue-400'
                      } text-right`}
                    />
                    {errors.name && <p className="text-sm text-destructive text-right">{errors.name}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-right block">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={newUser.email}
                      onChange={handleInputChange}
                      className={`${
                        theme === 'dark' 
                          ? 'bg-blue-900/30 border-blue-700 focus:border-blue-500 focus:ring-blue-500/50' 
                          : 'bg-white border-blue-200 focus:border-blue-400'
                      } text-right`}
                    />
                    {errors.email && <p className="text-sm text-destructive text-right">{errors.email}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-right block">رقم الهاتف</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={newUser.phone}
                      onChange={handleInputChange}
                      className={`${
                        theme === 'dark' 
                          ? 'bg-blue-900/30 border-blue-700 focus:border-blue-500 focus:ring-blue-500/50' 
                          : 'bg-white border-blue-200 focus:border-blue-400'
                      } text-right`}
                    />
                    {errors.phone && <p className="text-sm text-destructive text-right">{errors.phone}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-right block">كلمة المرور</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={newUser.password}
                        onChange={handleInputChange}
                        className={`${
                          theme === 'dark' 
                            ? 'bg-blue-900/30 border-blue-700 focus:border-blue-500 focus:ring-blue-500/50' 
                            : 'bg-white border-blue-200 focus:border-blue-400'
                        } text-right pr-10`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute left-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {errors.password && <p className="text-sm text-destructive text-right">{errors.password}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telegramId" className="text-right block">معرف تيليجرام (اختياري)</Label>
                    <Input
                      id="telegramId"
                      name="telegramId"
                      value={newUser.telegramId}
                      onChange={handleInputChange}
                      className={`${
                        theme === 'dark' 
                          ? 'bg-blue-900/30 border-blue-700 focus:border-blue-500 focus:ring-blue-500/50' 
                          : 'bg-white border-blue-200 focus:border-blue-400'
                      } text-right`}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className={`w-full ${
                      theme === 'dark' 
                        ? 'bg-blue-600 hover:bg-blue-700 shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:shadow-[0_0_20px_rgba(37,99,235,0.7)]' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    } transition-all duration-300`}
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        جاري الإنشاء...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        إنشاء مستخدم
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
          <DialogContent className={`max-w-md ${theme === 'dark' ? 'bg-slate-900 border-blue-800' : 'bg-white'}`}>
            <DialogHeader>
              <DialogTitle className={theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}>
                تعديل المستخدم
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleEditUser} className="space-y-4" dir="rtl">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-right block">الاسم</Label>
                <Input
                  id="name"
                  name="name"
                  value={editUser?.name || ''}
                  onChange={(e) => setEditUser(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className={`${
                    theme === 'dark' 
                      ? 'bg-blue-900/30 border-blue-700 focus:border-blue-500 focus:ring-blue-500/50' 
                      : 'bg-white border-blue-200 focus:border-blue-400'
                  } text-right`}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-right block">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={editUser?.email || ''}
                  onChange={(e) => setEditUser(prev => prev ? { ...prev, email: e.target.value } : null)}
                  className={`${
                    theme === 'dark' 
                      ? 'bg-blue-900/30 border-blue-700 focus:border-blue-500 focus:ring-blue-500/50' 
                      : 'bg-white border-blue-200 focus:border-blue-400'
                  } text-right`}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-right block">رقم الهاتف</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={editUser?.phone || ''}
                  onChange={(e) => setEditUser(prev => prev ? { ...prev, phone: e.target.value } : null)}
                  className={`${
                    theme === 'dark' 
                      ? 'bg-blue-900/30 border-blue-700 focus:border-blue-500 focus:ring-blue-500/50' 
                      : 'bg-white border-blue-200 focus:border-blue-400'
                  } text-right`}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role" className="text-right block">الدور</Label>
                <Select
                  value={editUser?.role || 'user'}
                  onValueChange={(value) => setEditUser(prev => prev ? { ...prev, role: value as 'user' | 'admin' } : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الدور" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">مستخدم</SelectItem>
                    <SelectItem value="admin">مدير</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-right block">كلمة المرور الجديدة (اختياري)</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={editUser?.password || ''}
                  onChange={(e) => setEditUser(prev => prev ? { ...prev, password: e.target.value } : null)}
                  placeholder="اتركه فارغاً إذا كنت لا تريد تغيير كلمة المرور"
                  className={`${
                    theme === 'dark' 
                      ? 'bg-blue-900/30 border-blue-700 focus:border-blue-500 focus:ring-blue-500/50' 
                      : 'bg-white border-blue-200 focus:border-blue-400'
                  } text-right`}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditUser(null);
                  }}
                >
                  إلغاء
                </Button>
                <Button 
                  type="submit"
                  className={`${
                    theme === 'dark' 
                      ? 'bg-blue-600 hover:bg-blue-700 shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:shadow-[0_0_20px_rgba(37,99,235,0.7)]' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } transition-all duration-300`}
                >
                  حفظ التغييرات
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default AdminUsers;