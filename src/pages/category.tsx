import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Category, Subcategory } from "@/lib/db/models";
import { useThemeStore } from "@/lib/theme";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

const CategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { theme } = useThemeStore();
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!categoryId) return;
      
      try {
        const [categoryData, subcategoriesData] = await Promise.all([
          api.getCategoryById(categoryId),
          api.getSubcategoriesByCategoryId(categoryId),
        ]);
        
        if (categoryData) {
          setCategory(categoryData);
        }
        
        setSubcategories(subcategoriesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [categoryId]);

  if (!categoryId) {
    return <div>Category ID is missing</div>;
  }

  return (
    <MainLayout><div className="container mx-auto py-8">
        <div className="flex items-center mb-8">
          <Link to="/categories" className={`text-sm ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} hover:underline`}>
            الفئات
          </Link>
          <ChevronRight className="mx-2 h-4 w-4" />
          <span className="font-medium">{isLoading ? 'جاري التحميل...' : category?.name}</span>
        </div>
        
        <h1 className={`text-3xl font-bold mb-8 text-center ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
          {isLoading ? 'جاري التحميل...' : `${category?.name} - الأقسام`}
        </h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array(4).fill(0).map((_, index) => (
              <Card key={index} className={`h-64 ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'} animate-pulse`} />
            ))
          ) : subcategories.length > 0 ? (
            subcategories.map((subcategory) => (
              <Link to={`/subcategories/${subcategory.id}`} key={subcategory.id}>
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
                        src={subcategory.image} 
                        alt={subcategory.name} 
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                        <h3 className="text-2xl font-bold text-white">{subcategory.name}</h3>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-xl text-muted-foreground">لا توجد أقسام في هذه الفئة</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default CategoryPage;