import { useState, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useThemeStore } from "@/lib/theme";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Category, Subcategory } from "@/lib/db/models";
import { Loader2, Plus, Pencil, Trash2, Upload, X, Tag, Package } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminCategories = () => {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<"categories" | "subcategories">("categories");
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Category state
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isCategoryDeleteDialogOpen, setIsCategoryDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState<string | null>(null);
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);
  const [categoryName, setCategoryName] = useState("");
  
  // Subcategory state
  const [isSubcategoryDialogOpen, setIsSubcategoryDialogOpen] = useState(false);
  const [isSubcategoryDeleteDialogOpen, setIsSubcategoryDeleteDialogOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [subcategoryImagePreview, setSubcategoryImagePreview] = useState<string | null>(null);
  const [subcategoryImageFile, setSubcategoryImageFile] = useState<File | null>(null);
  const [subcategoryName, setSubcategoryName] = useState("");
  const [subcategoryCategoryId, setSubcategoryCategoryId] = useState("");
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, subcategoriesData] = await Promise.all([
          api.getCategories(),
          api.getSubcategories(),
        ]);
        
        setCategories(categoriesData);
        setSubcategories(subcategoriesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء جلب البيانات",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
  // Category handlers
  const handleCategoryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setCategoryImageFile(file);
    setCategoryImagePreview(URL.createObjectURL(file));
  };
  
  const clearCategoryImageSelection = () => {
    setCategoryImageFile(null);
    setCategoryImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const openNewCategoryDialog = () => {
    setSelectedCategory(null);
    setCategoryName("");
    setCategoryImageFile(null);
    setCategoryImagePreview(null);
    setIsCategoryDialogOpen(true);
  };
  
  const openEditCategoryDialog = (category: Category) => {
    setSelectedCategory(category);
    setCategoryName(category.name);
    setCategoryImagePreview(category.image);
    setIsCategoryDialogOpen(true);
  };
  
  const openDeleteCategoryDialog = (category: Category) => {
    setSelectedCategory(category);
    setIsCategoryDeleteDialogOpen(true);
  };
  
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryName) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم الفئة",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const categoryData = {
        name: categoryName,
        image: categoryImagePreview || "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=500&auto=format&fit=crop",
      };
      
      if (selectedCategory) {
        // Update existing category
        const updatedCategory = await api.updateCategory(selectedCategory.id, categoryData, categoryImageFile || undefined);
        
        setCategories(prev => 
          prev.map(c => c.id === updatedCategory.id ? updatedCategory : c)
        );
        
        toast({
          title: "تم التحديث",
          description: `تم تحديث الفئة ${updatedCategory.name} بنجاح`,
        });
      } else {
        // Create new category
        const newCategory = await api.createCategory(categoryData, categoryImageFile || undefined);
        
        setCategories(prev => [...prev, newCategory]);
        
        toast({
          title: "تم الإنشاء",
          description: `تم إنشاء الفئة ${newCategory.name} بنجاح`,
        });
      }
      
      setIsCategoryDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء حفظ الفئة",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    
    try {
      await api.deleteCategory(selectedCategory.id);
      
      setCategories(prev => prev.filter(c => c.id !== selectedCategory.id));
      
      // Also remove subcategories that belong to this category
      setSubcategories(prev => prev.filter(s => s.categoryId !== selectedCategory.id));
      
      toast({
        title: "تم الحذف",
        description: `تم حذف الفئة ${selectedCategory.name} بنجاح`,
      });
      
      setIsCategoryDeleteDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء حذف الفئة",
        variant: "destructive",
      });
    }
  };
  
  // Subcategory handlers
  const handleSubcategoryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSubcategoryImageFile(file);
    setSubcategoryImagePreview(URL.createObjectURL(file));
  };
  
  const clearSubcategoryImageSelection = () => {
    setSubcategoryImageFile(null);
    setSubcategoryImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const openNewSubcategoryDialog = () => {
    setSelectedSubcategory(null);
    setSubcategoryName("");
    setSubcategoryCategoryId("");
    setSubcategoryImageFile(null);
    setSubcategoryImagePreview(null);
    setIsSubcategoryDialogOpen(true);
  };
  
  const openEditSubcategoryDialog = (subcategory: Subcategory) => {
    setSelectedSubcategory(subcategory);
    setSubcategoryName(subcategory.name);
    setSubcategoryCategoryId(subcategory.categoryId);
    setSubcategoryImagePreview(subcategory.image);
    setIsSubcategoryDialogOpen(true);
  };
  
  const openDeleteSubcategoryDialog = (subcategory: Subcategory) => {
    setSelectedSubcategory(subcategory);
    setIsSubcategoryDeleteDialogOpen(true);
  };
  
  const handleSubcategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subcategoryName || !subcategoryCategoryId) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم القسم واختيار الفئة",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const subcategoryData = {
        name: subcategoryName,
        categoryId: subcategoryCategoryId,
        image: subcategoryImagePreview || "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=500&auto=format&fit=crop",
      };
      
      if (selectedSubcategory) {
        // Update existing subcategory
        const updatedSubcategory = await api.updateSubcategory(selectedSubcategory.id, subcategoryData, subcategoryImageFile || undefined);
        
        setSubcategories(prev => 
          prev.map(s => s.id === updatedSubcategory.id ? updatedSubcategory : s)
        );
        
        toast({
          title: "تم التحديث",
          description: `تم تحديث القسم ${updatedSubcategory.name} بنجاح`,
        });
      } else {
        // Create new subcategory
        const newSubcategory = await api.createSubcategory(subcategoryData, subcategoryImageFile || undefined);
        
        setSubcategories(prev => [...prev, newSubcategory]);
        
        toast({
          title: "تم الإنشاء",
          description: `تم إنشاء القسم ${newSubcategory.name} بنجاح`,
        });
      }
      
      setIsSubcategoryDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء حفظ القسم",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteSubcategory = async () => {
    if (!selectedSubcategory) return;
    
    try {
      await api.deleteSubcategory(selectedSubcategory.id);
      
      setSubcategories(prev => prev.filter(s => s.id !== selectedSubcategory.id));
      
      toast({
        title: "تم الحذف",
        description: `تم حذف القسم ${selectedSubcategory.name} بنجاح`,
      });
      
      setIsSubcategoryDeleteDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء حذف القسم",
        variant: "destructive",
      });
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
          إدارة الفئات والأقسام
        </h1>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "categories" | "subcategories")} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="categories">الفئات</TabsTrigger>
            <TabsTrigger value="subcategories">الأقسام</TabsTrigger>
          </TabsList>
          
          <TabsContent value="categories" className="mt-6">
            <div className="flex justify-end mb-6">
              <Button 
                onClick={openNewCategoryDialog}
                className={`${
                  theme === 'dark' 
                    ? 'bg-green-600 hover:bg-green-700 shadow-[0_0_15px_rgba(22,163,74,0.5)] hover:shadow-[0_0_20px_rgba(22,163,74,0.7)]' 
                    : 'bg-green-600 hover:bg-green-700'
                } transition-all duration-300`}
              >
                <Plus className="h-5 w-5 mr-2" />
                إضافة فئة جديدة
              </Button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : categories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(category => {
                  const categorySubcategories = subcategories.filter(s => s.categoryId === category.id);
                  
                  return (
                    <Card 
                      key={category.id} 
                      className={`overflow-hidden border ${
                        theme === 'dark' 
                          ? 'border-blue-800 bg-blue-950/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                          : 'border-blue-200 hover:shadow-lg'
                      } transition-all duration-300`}
                    >
                      <div className="relative h-48">
                        <img 
                          src={category.image} 
                          alt={category.name} 
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                          <Button 
                            size="icon" 
                            variant="secondary" 
                            onClick={() => openEditCategoryDialog(category)}
                            className={`rounded-full ${
                              theme === 'dark' 
                                ? 'bg-blue-800/80 hover:bg-blue-700/80' 
                                : 'bg-blue-100/80 hover:bg-blue-200/80'
                            }`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="destructive" 
                            onClick={() => openDeleteCategoryDialog(category)}
                            className={`rounded-full ${
                              theme === 'dark' 
                                ? 'bg-red-800/80 hover:bg-red-700/80' 
                                : 'bg-red-100/80 hover:bg-red-200/80 text-red-600'
                            }`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <CardContent className="p-4">
                        <h3 className={`font-bold text-lg mb-2 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                          {category.name}
                        </h3>
                        
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Tag className="h-4 w-4 mr-1" />
                          <span>{categorySubcategories.length} قسم</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className={`h-16 w-16 mx-auto mb-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                <h2 className="text-2xl font-medium mb-2">لا توجد فئات</h2>
                <p className="text-muted-foreground mb-6">لم تقم بإضافة أي فئات بعد</p>
                <Button 
                  onClick={openNewCategoryDialog}
                  className={`${
                    theme === 'dark' 
                      ? 'bg-blue-600 hover:bg-blue-700 shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:shadow-[0_0_20px_rgba(37,99,235,0.7)]' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } transition-all duration-300`}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  إضافة فئة جديدة
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="subcategories" className="mt-6">
            <div className="flex justify-end mb-6">
              <Button 
                onClick={openNewSubcategoryDialog}
                disabled={categories.length === 0}
                className={`${
                  theme === 'dark' 
                    ? 'bg-green-600 hover:bg-green-700 shadow-[0_0_15px_rgba(22,163,74,0.5)] hover:shadow-[0_0_20px_rgba(22,163,74,0.7)]' 
                    : 'bg-green-600 hover:bg-green-700'
                } transition-all duration-300`}
              >
                <Plus className="h-5 w-5 mr-2" />
                إضافة قسم جديد
              </Button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : subcategories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subcategories.map(subcategory => {
                  const parentCategory = categories.find(c => c.id === subcategory.categoryId);
                  
                  return (
                    <Card 
                      key={subcategory.id} 
                      className={`overflow-hidden border ${
                        theme === 'dark' 
                          ? 'border-blue-800 bg-blue-950/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                          : 'border-blue-200 hover:shadow-lg'
                      } transition-all duration-300`}
                    >
                      <div className="relative h-48">
                        <img 
                          src={subcategory.image} 
                          alt={subcategory.name} 
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                          <Button 
                            size="icon" 
                            variant="secondary" 
                            onClick={() => openEditSubcategoryDialog(subcategory)}
                            className={`rounded-full ${
                              theme === 'dark' 
                                ? 'bg-blue-800/80 hover:bg-blue-700/80' 
                                : 'bg-blue-100/80 hover:bg-blue-200/80'
                            }`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="destructive" 
                            onClick={() => openDeleteSubcategoryDialog(subcategory)}
                            className={`rounded-full ${
                              theme === 'dark' 
                                ? 'bg-red-800/80 hover:bg-red-700/80' 
                                : 'bg-red-100/80 hover:bg-red-200/80 text-red-600'
                            }`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <CardContent className="p-4">
                        <h3 className={`font-bold text-lg mb-2 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                          {subcategory.name}
                        </h3>
                        
                        {parentCategory && (
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            theme === 'dark' ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-700'
                          }`}>
                            <Package className="h-3 w-3 mr-1" />
                            {parentCategory.name}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Tag className={`h-16 w-16 mx-auto mb-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                <h2 className="text-2xl font-medium mb-2">لا توجد أقسام</h2>
                <p className="text-muted-foreground mb-6">
                  {categories.length === 0 
                    ? "يجب إضافة فئة أولاً قبل إضافة الأقسام" 
                    : "لم تقم بإضافة أي أقسام بعد"}
                </p>
                {categories.length > 0 && (
                  <Button 
                    onClick={openNewSubcategoryDialog}
                    className={`${
                      theme === 'dark' 
                        ? 'bg-blue-600 hover:bg-blue-700 shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:shadow-[0_0_20px_rgba(37,99,235,0.7)]' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    } transition-all duration-300`}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    إضافة قسم جديد
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Category Form Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className={`max-w-md ${theme === 'dark' ? 'bg-slate-900 border-blue-800' : 'bg-white'}`}>
          <DialogHeader>
            <DialogTitle className={theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}>
              {selectedCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleCategorySubmit} className="space-y-6" dir="rtl">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="categoryName" className="text-right block">اسم الفئة</Label>
                <Input
                  id="categoryName"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className={`${
                    theme === 'dark' 
                      ? 'bg-blue-900/30 border-blue-700 focus:border-blue-500 focus:ring-blue-500/50' 
                      : 'bg-white border-blue-200 focus:border-blue-400'
                  } text-right`}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-right block">صورة الفئة</Label>
                <div className={`border-2 border-dashed rounded-lg p-4 text-center ${
                  theme === 'dark' 
                    ? 'border-blue-700 bg-blue-900/20 hover:bg-blue-900/30' 
                    : 'border-blue-200 bg-blue-50/50 hover:bg-blue-50'
                } transition-all duration-300 cursor-pointer`}
                onClick={() => fileInputRef.current?.click()}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleCategoryImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  {categoryImagePreview ? (
                    <div className="relative">
                      <img
                        src={categoryImagePreview}
                        alt="Category preview"
                        className="mx-auto max-h-48 rounded-lg"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearCategoryImageSelection();
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="py-4">
                      <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        اضغط لاختيار صورة أو اسحب وأفلت
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCategoryDialogOpen(false)}
                className={`${
                  theme === 'dark' 
                    ? 'border-blue-700 hover:bg-blue-900/30 text-blue-400' 
                    : 'border-blue-300 hover:bg-blue-50 text-blue-600'
                }`}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className={`${
                  theme === 'dark' 
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:shadow-[0_0_20px_rgba(37,99,235,0.7)]' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } transition-all duration-300`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  selectedCategory ? 'تحديث الفئة' : 'إضافة الفئة'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Category Delete Confirmation Dialog */}
      <Dialog open={isCategoryDeleteDialogOpen} onOpenChange={setIsCategoryDeleteDialogOpen}>
        <DialogContent className={`max-w-md ${theme === 'dark' ? 'bg-slate-900 border-red-800' : 'bg-white'}`}>
          <DialogHeader>
            <DialogTitle className={theme === 'dark' ? 'text-red-300' : 'text-red-700'}>
              تأكيد الحذف
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-center">
              هل أنت متأكد من حذف الفئة{" "}
              <span className="font-bold">{selectedCategory?.name}</span>؟
            </p>
            <p className="text-center text-sm text-muted-foreground mt-2">
              سيتم حذف جميع الأقسام المرتبطة بهذه الفئة أيضًا. لا يمكن التراجع عن هذا الإجراء.
            </p>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCategoryDeleteDialogOpen(false)}
              className={`${
                theme === 'dark' 
                  ? 'border-blue-700 hover:bg-blue-900/30 text-blue-400' 
                  : 'border-blue-300 hover:bg-blue-50 text-blue-600'
              }`}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteCategory}
              className={`${
                theme === 'dark' 
                  ? 'bg-red-600 hover:bg-red-700 shadow-[0_0_15px_rgba(220,38,38,0.5)] hover:shadow-[0_0_20px_rgba(220,38,38,0.7)]' 
                  : 'bg-red-600 hover:bg-red-700'
              } transition-all duration-300`}
            >
              حذف الفئة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Subcategory Form Dialog */}
      <Dialog open={isSubcategoryDialogOpen} onOpenChange={setIsSubcategoryDialogOpen}>
        <DialogContent className={`max-w-md ${theme === 'dark' ? 'bg-slate-900 border-blue-800' : 'bg-white'}`}>
          <DialogHeader>
            <DialogTitle className={theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}>
              {selectedSubcategory ? 'تعديل القسم' : 'إضافة قسم جديد'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubcategorySubmit} className="space-y-6" dir="rtl">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subcategoryName" className="text-right block">اسم القسم</Label>
                <Input
                  id="subcategoryName"
                  value={subcategoryName}
                  onChange={(e) => setSubcategoryName(e.target.value)}
                  className={`${
                    theme === 'dark' 
                      ? 'bg-blue-900/30 border-blue-700 focus:border-blue-500 focus:ring-blue-500/50' 
                      : 'bg-white border-blue-200 focus:border-blue-400'
                  } text-right`}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="categoryId" className="text-right block">الفئة</Label>
                <Select
                  value={subcategoryCategoryId}
                  onValueChange={setSubcategoryCategoryId}
                >
                  <SelectTrigger className={`${
                    theme === 'dark' 
                      ? 'bg-blue-900/30 border-blue-700 focus:border-blue-500 focus:ring-blue-500/50' 
                      : 'bg-white border-blue-200 focus:border-blue-400'
                  } text-right`}>
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-right block">صورة القسم</Label>
                <div className={`border-2 border-dashed rounded-lg p-4 text-center ${
                  theme === 'dark' 
                    ? 'border-blue-700 bg-blue-900/20 hover:bg-blue-900/30' 
                    : 'border-blue-200 bg-blue-50/50 hover:bg-blue-50'
                } transition-all duration-300 cursor-pointer`}
                onClick={() => fileInputRef.current?.click()}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleSubcategoryImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  {subcategoryImagePreview ? (
                    <div className="relative">
                      <img
                        src={subcategoryImagePreview}
                        alt="Subcategory preview"
                        className="mx-auto max-h-48 rounded-lg"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearSubcategoryImageSelection();
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="py-4">
                      <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        اضغط لاختيار صورة أو اسحب وأفلت
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSubcategoryDialogOpen(false)}
                className={`${
                  theme === 'dark' 
                    ? 'border-blue-700 hover:bg-blue-900/30 text-blue-400' 
                    : 'border-blue-300 hover:bg-blue-50 text-blue-600'
                }`}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className={`${
                  theme === 'dark' 
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:shadow-[0_0_20px_rgba(37,99,235,0.7)]' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } transition-all duration-300`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  selectedSubcategory ? 'تحديث القسم' : 'إضافة القسم'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Subcategory Delete Confirmation Dialog */}
      <Dialog open={isSubcategoryDeleteDialogOpen} onOpenChange={setIsSubcategoryDeleteDialogOpen}>
        <DialogContent className={`max-w-md ${theme === 'dark' ? 'bg-slate-900 border-red-800' : 'bg-white'}`}>
          <DialogHeader>
            <DialogTitle className={theme === 'dark' ? 'text-red-300' : 'text-red-700'}>
              تأكيد الحذف
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-center">
              هل أنت متأكد من حذف القسم{" "}
              <span className="font-bold">{selectedSubcategory?.name}</span>؟
            </p>
            <p className="text-center text-sm text-muted-foreground mt-2">
              لا يمكن التراجع عن هذا الإجراء.
            </p>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSubcategoryDeleteDialogOpen(false)}
              className={`${
                theme === 'dark' 
                  ? 'border-blue-700 hover:bg-blue-900/30 text-blue-400' 
                  : 'border-blue-300 hover:bg-blue-50 text-blue-600'
              }`}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteSubcategory}
              className={`${
                theme === 'dark' 
                  ? 'bg-red-600 hover:bg-red-700 shadow-[0_0_15px_rgba(220,38,38,0.5)] hover:shadow-[0_0_20px_rgba(220,38,38,0.7)]' 
                  : 'bg-red-600 hover:bg-red-700'
              } transition-all duration-300`}
            >
              حذف القسم
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default AdminCategories;