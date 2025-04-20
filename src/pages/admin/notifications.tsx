import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useThemeStore } from "@/lib/theme";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { User } from "@/lib/stores/auth-store";
import { Loader2, Send, Users, BellRing, CheckCircle2 } from "lucide-react";

const AdminNotifications = () => {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState<"telegram" | "all">("telegram");
  const [sentCount, setSentCount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  
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
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء جلب المستخدمين",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, [toast]);
  
  useEffect(() => {
    if (selectAll) {
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  }, [selectAll, users]);
  
  const handleUserSelection = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };
  
  const handleSendNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!notificationMessage || selectedUsers.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى كتابة رسالة واختيار مستخدم واحد على الأقل",
        variant: "destructive",
      });
      return;
    }
    
    setIsSending(true);
    setSentCount(0);
    
    try {
      let successCount = 0;
      
      // Send notifications to each selected user
      for (const userId of selectedUsers) {
        const user = users.find(u => u.id === userId);
        
        if (!user) continue;
        
        // For Telegram notifications
        if (notificationType === "telegram" || notificationType === "all") {
          if (user.telegramId) {
            const success = await api.sendTelegramNotification(userId, notificationMessage);
            if (success) successCount++;
          }
        }
        
        // In a real app, we would also handle SMS notifications here
      }
      
      setSentCount(successCount);
      setShowSuccess(true);
      
      toast({
        title: "تم الإرسال",
        description: `تم إرسال الإشعارات بنجاح إلى ${successCount} مستخدم`,
      });
      
      // Reset form after successful send
      setNotificationMessage("");
      setSelectedUsers([]);
      setSelectAll(false);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إرسال الإشعارات",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };
  
  // Redirect if not admin
  if (user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className={`text-3xl font-bold mb-8 text-center ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
          إرسال إشعارات للعملاء
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className={`border ${
              theme === 'dark' ? 'border-blue-800 bg-blue-950/30' : 'border-blue-200'
            }`}>
              <CardHeader>
                <CardTitle className={theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}>
                  <div className="flex items-center">
                    <BellRing className="h-5 w-5 mr-2" />
                    رسالة الإشعار
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendNotifications} className="space-y-6" dir="rtl">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="notificationType" className="text-right block">نوع الإشعار</Label>
                      <Select
                        value={notificationType}
                        onValueChange={(value) => setNotificationType(value as "telegram" | "all")}
                      >
                        <SelectTrigger className={`${
                          theme === 'dark' 
                            ? 'bg-blue-900/30 border-blue-700 focus:border-blue-500 focus:ring-blue-500/50' 
                            : 'bg-white border-blue-200 focus:border-blue-400'
                        } text-right`}>
                          <SelectValue placeholder="اختر نوع الإشعار" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="telegram">تيليجرام فقط</SelectItem>
                          <SelectItem value="all">تيليجرام</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notificationMessage" className="text-right block">نص الإشعار</Label>
                      <Textarea
                        id="notificationMessage"
                        value={notificationMessage}
                        onChange={(e) => setNotificationMessage(e.target.value)}
                        placeholder="أدخل نص الإشعار الذي سيتم إرساله للعملاء"
                        rows={5}
                        className={`${
                          theme === 'dark' 
                            ? 'bg-blue-900/30 border-blue-700 focus:border-blue-500 focus:ring-blue-500/50' 
                            : 'bg-white border-blue-200 focus:border-blue-400'
                        } text-right`}
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={isSending || !notificationMessage || selectedUsers.length === 0}
                      className={`w-full ${
                        theme === 'dark' 
                          ? 'bg-pink-600 hover:bg-pink-700 shadow-[0_0_15px_rgba(219,39,119,0.5)] hover:shadow-[0_0_20px_rgba(219,39,119,0.7)]' 
                          : 'bg-pink-600 hover:bg-pink-700'
                      } transition-all duration-300`}
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          جاري الإرسال...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          إرسال الإشعارات ({selectedUsers.length})
                        </>
                      )}
                    </Button>
                  </div>
                </form>
                
                {showSuccess && (
                  <div className={`mt-6 p-4 rounded-lg flex items-center ${
                    theme === 'dark' ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'
                  }`}>
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    <span>تم إرسال الإشعارات بنجاح إلى {sentCount} مستخدم</span>
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      العملاء
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id="selectAll"
                        checked={selectAll}
                        onCheckedChange={() => setSelectAll(!selectAll)}
                      />
                      <Label htmlFor="selectAll" className="mr-2 text-sm">
                        تحديد الكل
                      </Label>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : users.length > 0 ? (
                  <div className="space-y-4">
                    {users.filter(u => u.role === "customer").map((user) => (
                      <div 
                        key={user.id} 
                        className={`p-4 rounded-lg ${
                          theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{user.name}</h3>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <p className="text-sm text-muted-foreground">{user.phone}</p>
                            {user.telegramId ? (
                              <p className={`text-sm ${
                                theme === 'dark' ? 'text-green-400' : 'text-green-600'
                              }`}>
                                Telegram: {user.telegramId}
                              </p>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                لا يوجد معرف تيليجرام
                              </p>
                            )}
                          </div>
                          <div>
                            <Checkbox
                              id={`user-${user.id}`}
                              checked={selectedUsers.includes(user.id)}
                              onCheckedChange={() => handleUserSelection(user.id)}
                              disabled={notificationType === "telegram" && !user.telegramId}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">لا يوجد عملاء</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminNotifications;