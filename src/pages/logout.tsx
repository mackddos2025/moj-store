import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useToast } from "@/hooks/use-toast";

export default function Logout() {
  const { logout } = useAuthStore();
  const { toast } = useToast();
  
  useEffect(() => {
    logout();
    toast({
      title: "تم تسجيل الخروج",
      description: "تم تسجيل خروجك بنجاح",
    });
  }, [logout, toast]);
  
  return <Navigate to="/" />;
}