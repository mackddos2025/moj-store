import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Category } from "@/lib/db/models";
import { useThemeStore } from "@/lib/theme";
import { motion } from "framer-motion";

const Categories = () => {
  const { theme } = useThemeStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className={`text-3xl font-bold mb-8 text-center ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
          جميع الفئات
        </h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array(6).fill(0).map((_, index) => (
              <Card key={index} className={`h-64 ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'} animate-pulse`} />
            ))
          ) : (
            categories.map((category) => (
              <Link to={`/categories/${category.id}`} key={category.id}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className={`h-64 overflow-hidden border ${
                    theme === 'dark' 
                      ? 'border-blue-800 bg-blue-900/20 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                      : 'border-blue-200 hover:shadow-lg'
                  } transition-all duration-300`}>
                    <div className="relative h-full">
                      <img 
                        src={category.image} 
                        alt={category.name} 
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                        <h3 className="text-2xl font-bold text-white">{category.name}</h3>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </Link>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Categories;