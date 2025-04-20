import { useState, useEffect, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useThemeStore } from "@/lib/theme";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Product, Category, Subcategory, Discount } from "@/lib/db/models";
import { Loader2, Plus, Pencil, Trash2, Upload, X, Tag, Package, DollarSign, BarChart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminProducts = () => {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    cost: "",
    stock: "",
    categoryId: "",
    subcategoryId: "",
  });
  
  const [discounts, setDiscounts] = useState<{ minQuantity: number; discountPercentage: number }[]>([]);
  const [newDiscount, setNewDiscount] = useState({ minQuantity: "", discountPercentage: "" });
  
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: 0,
    cost: 0,
    stock: 0,
    categoryId: "",
    subcategoryId: "",
    image: "",
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData, subcategoriesData] = await Promise.all([
          api.getProducts(),
          api.getCategories(),
          api.getSubcategories(),
        ]);
        
        setProducts(productsData);
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
  
  // Filter subcategories when category changes
  useEffect(() => {
    if (formData.categoryId) {
      setFilteredSubcategories(
        subcategories.filter(subcategory => subcategory.categoryId === formData.categoryId)
      );
    } else {
      setFilteredSubcategories([]);
    }
  }, [formData.categoryId, subcategories]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setNewDiscount(prev => ({ ...prev, [field]: e.target.value }));
  };
  
  const addDiscount = () => {
    if (!newDiscount.minQuantity || !newDiscount.discountPercentage) return;
    
    const minQuantity = parseInt(newDiscount.minQuantity);
    const discountPercentage = parseFloat(newDiscount.discountPercentage);
    
    if (isNaN(minQuantity) || isNaN(discountPercentage)) return;
    if (minQuantity <= 0 || discountPercentage <= 0 || discountPercentage > 100) return;
    
    setDiscounts(prev => [...prev, { minQuantity, discountPercentage }]);
    setNewDiscount({ minQuantity: "", discountPercentage: "" });
  };
  
  const removeDiscount = (index: number) => {
    setDiscounts(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };
  
  const clearImageSelection = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const openNewProductDialog = () => {
    setSelectedProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      cost: "",
      stock: "",
      categoryId: "",
      subcategoryId: "",
    });
    setDiscounts([]);
    setImageFile(null);
    setImagePreview(null);
    setIsDialogOpen(true);
  };
  
  const openEditProductDialog = (product: Product) => {
    alert('Edit button clicked'); // Debug alert
    console.log('Opening edit dialog for product:', product);
    setSelectedProduct(product);
    
    // Find the category for this subcategory
    const subcategory = subcategories.find(sub => sub.id === product.subcategoryId);
    const categoryId = subcategory ? subcategory.categoryId : "";
    
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      cost: product.cost.toString(),
      stock: product.stock.toString(),
      categoryId,
      subcategoryId: product.subcategoryId,
    });
    
    setDiscounts(product.discounts?.map(d => ({
      minQuantity: d.minQuantity,
      discountPercentage: d.discountPercentage
    })) || []);
    
    setImagePreview(product.image);
    console.log('Setting dialog open to true');
    setIsDialogOpen(true);
  };
  
  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.stock || !formData.subcategoryId) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create discount objects with proper structure
      const formattedDiscounts: Discount[] = discounts.map((discount, index) => ({
        id: `temp-${index}`,
        productId: selectedProduct?.id || 'new',
        minQuantity: discount.minQuantity,
        discountPercentage: discount.discountPercentage
      }));
      
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
        stock: parseInt(formData.stock),
        subcategoryId: formData.subcategoryId,
        image: imagePreview || "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=500&auto=format&fit=crop",
        discounts: formattedDiscounts,
      };
      
      if (selectedProduct) {
        // Update existing product
        const updatedProduct = await api.updateProduct(selectedProduct.id, productData, imageFile || undefined);
        
        setProducts(prev => 
          prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)
        );
        
        toast({
          title: "تم التحديث",
          description: `تم تحديث المنتج ${updatedProduct.name} بنجاح`,
        });
      } else {
        // Create new product
        const newProduct = await api.createProduct(productData as any, imageFile || undefined);
        
        setProducts(prev => [...prev, newProduct]);
        
        toast({
          title: "تم الإنشاء",
          description: `تم إنشاء المنتج ${newProduct.name} بنجاح`,
        });
      }
      
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء حفظ المنتج",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!selectedProduct) return;
    
    try {
      await api.deleteProduct(selectedProduct.id);
      
      setProducts(prev => prev.filter(p => p.id !== selectedProduct.id));
      
      toast({
        title: "تم الحذف",
        description: `تم حذف المنتج ${selectedProduct.name} بنجاح`,
      });
      
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء حذف المنتج",
        variant: "destructive",
      });
    }
  };
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    
    const subcategory = subcategories.find(sub => sub.id === product.subcategoryId);
    if (!subcategory) return false;
    
    return subcategory.categoryId === activeTab && matchesSearch;
  });
  
  // Redirect if not admin
  if (user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className={`text-3xl font-bold mb-8 text-center ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
          إدارة المنتجات
        </h1>
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="w-full md:w-1/2">
            <Input
              placeholder="ابحث عن منتج..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${
                theme === 'dark' 
                  ? 'bg-blue-900/30 border-blue-700 focus:border-blue-500 focus:ring-blue-500/50' 
                  : 'bg-white border-blue-200 focus:border-blue-400'
              } text-right`}
            />
          </div>
          
          <Button 
            onClick={openNewProductDialog}
            className={`${
              theme === 'dark' 
                ? 'bg-green-600 hover:bg-green-700 shadow-[0_0_15px_rgba(22,163,74,0.5)] hover:shadow-[0_0_20px_rgba(22,163,74,0.7)]' 
                : 'bg-green-600 hover:bg-green-700'
            } transition-all duration-300`}
          >
            <Plus className="h-5 w-5 mr-2" />
            إضافة منتج جديد
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="w-full overflow-x-auto flex-nowrap">
            <TabsTrigger value="all" className="flex-shrink-0">جميع المنتجات</TabsTrigger>
            {categories.map(category => (
              <TabsTrigger key={category.id} value={category.id} className="flex-shrink-0">
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => {
              const subcategory = subcategories.find(sub => sub.id === product.subcategoryId);
              const category = subcategory ? categories.find(cat => cat.id === subcategory.categoryId) : null;
              
              return (
                <Card 
                  key={product.id} 
                  className={`overflow-hidden border ${
                    theme === 'dark' 
                      ? 'border-blue-800 bg-blue-950/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                      : 'border-blue-200 hover:shadow-lg'
                  } transition-all duration-300`}
                >
                  <div className="relative h-48">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        onClick={() => openEditProductDialog(product)}
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
                        onClick={() => openDeleteDialog(product)}
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
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                        {product.name}
                      </h3>
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        theme === 'dark' ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700'
                      }`}>
                        {product.price.toLocaleString()} ل.س
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {category && (
                        <div className={`flex items-center px-2 py-1 rounded-full text-xs ${
                          theme === 'dark' ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-700'
                        }`}>
                          <Package className="h-3 w-3 mr-1" />
                          {category.name}
                        </div>
                      )}
                      
                      {subcategory && (
                        <div className={`flex items-center px-2 py-1 rounded-full text-xs ${
                          theme === 'dark' ? 'bg-purple-900/50 text-purple-400' : 'bg-purple-100 text-purple-700'
                        }`}>
                          <Tag className="h-3 w-3 mr-1" />
                          {subcategory.name}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className={`flex items-center text-sm ${
                        product.stock > 10 
                          ? theme === 'dark' ? 'text-green-400' : 'text-green-600'
                          : product.stock > 0
                            ? theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                            : theme === 'dark' ? 'text-red-400' : 'text-red-600'
                      }`}>
                        <span>المخزون: {product.stock}</span>
                      </div>
                      
                      {product.discounts && product.discounts.length > 0 && (
                        <div className={`flex items-center text-xs ${
                          theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                        }`}>
                          <BarChart className="h-3 w-3 mr-1" />
                          <span>{product.discounts.length} خصومات</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className={`h-16 w-16 mx-auto mb-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
            <h2 className="text-2xl font-medium mb-2">لا توجد منتجات</h2>
            <p className="text-muted-foreground mb-6">
              {searchTerm ? 'لا توجد منتجات تطابق بحثك' : 'لم تقم بإضافة أي منتجات بعد'}
            </p>
            <Button 
              onClick={openNewProductDialog}
              className={`${
                theme === 'dark' 
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:shadow-[0_0_20px_rgba(37,99,235,0.7)]' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } transition-all duration-300`}
            >
              <Plus className="h-5 w-5 mr-2" />
              إضافة منتج جديد
            </Button>
          </div>
        )}
      </div>
      
      {/* Product Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={`max-w-3xl ${theme === 'dark' ? 'bg-slate-900 border-blue-800' : 'bg-white'}`}>
          <DialogHeader>
            <DialogTitle className={theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}>
              {selectedProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-right block">اسم المنتج</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`${
                      theme === 'dark' 
                        ? 'bg-blue-900/30 border-blue-700 focus:border-blue-500 focus:ring-blue-500/50' 
                        : 'bg-white border-blue-200 focus:border-blue-400'
                    } text-right`}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-right block">وصف المنتج</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className={`${
                      theme === 'dark' 
                        ? 'bg-blue-900/30 border-blue-700 focus:border-blue-500 focus:ring-blue-500/50' 
                        : 'bg-white border-blue-200 focus:border-blue-400'
                    } text-right`}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-right block">سعر البيع</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      className={`${
                        theme === 'dark' 
                          ? 'bg-blue-900/30 border-blue-700 focus:border-blue-500 focus:ring-blue-500/50' 
                          : 'bg-white border-blue-200 focus:border-blue-400'
                      } text-right`}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cost" className="text-right block">سعر التكلفة</Label>
                    <Input
                      id="cost"
                      name="cost"
                      type="number"
                      value={formData.cost}
                      onChange={handleInputChange}
                      className={`${
                        theme === 'dark' 
                          ? 'bg-blue-900/30 border-blue-700 focus:border-blue-500 focus:ring-blue-500/50' 
                          : 'bg-white border-blue-200 focus:border-blue-400'
                      } text-right`}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock" className="text-right block">المخزون</Label>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={handleInputChange}
                      className={`${
                        theme === 'dark' 
                          ? 'bg-blue-900/30 border-blue-700 focus:border-blue-500 focus:ring-blue-500/50' 
                          : 'bg-white border-blue-200 focus:border-blue-400'
                      } text-right`}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="categoryId" className="text-right block">الفئة</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => handleSelectChange("categoryId", value)}
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
                  <Label htmlFor="subcategoryId" className="text-right block">القسم</Label>
                  <Select
                    value={formData.subcategoryId}
                    onValueChange={(value) => handleSelectChange("subcategoryId", value)}
                    disabled={!formData.categoryId}
                  >
                    <SelectTrigger className={`${
                      theme === 'dark' 
                        ? 'bg-blue-900/30 border-blue-700 focus:border-blue-500 focus:ring-blue-500/50' 
                        : 'bg-white border-blue-200 focus:border-blue-400'
                    } text-right`}>
                      <SelectValue placeholder="اختر القسم" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSubcategories.map(subcategory => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-right block">صورة المنتج</Label>
                  <div className={`border-2 border-dashed rounded-lg p-4 text-center ${
                    theme === 'dark' 
                      ? 'border-blue-700 bg-blue-900/20 hover:bg-blue-900/30' 
                      : 'border-blue-200 bg-blue-50/50 hover:bg-blue-50'
                  } transition-all duration-300 cursor-pointer`}
                  onClick={() => fileInputRef.current?.click()}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                    
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Product preview"
                          className="mx-auto max-h-48 rounded-lg"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2 h-8 w-8 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearImageSelection();
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
                
                <div className="space-y-2">
                  <Label className="text-right block">خصومات الكمية</Label>
                  <div className={`rounded-lg p-4 ${
                    theme === 'dark' 
                      ? 'bg-blue-900/20' 
                      : 'bg-blue-50/50'
                  }`}>
                    {discounts.length > 0 ? (
                      <div className="space-y-2 mb-4">
                        {discounts.map((discount, index) => (
                          <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-background">
                            <div>
                              <span className="font-medium">{discount.minQuantity}+ قطعة: </span>
                              <span className={theme === 'dark' ? 'text-green-400' : 'text-green-600'}>
                                خصم {discount.discountPercentage}%
                              </span>
                            </div>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => removeDiscount(index)}
                              className={theme === 'dark' ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-50 text-red-600'}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground mb-4 text-center">
                        لا توجد خصومات. أضف خصومات حسب الكمية.
                      </p>
                    )}
                    
                    <div className="flex gap-2">
                      <Input
                        placeholder="الكمية"
                        type="number"
                        min="1"
                        value={newDiscount.minQuantity}
                        onChange={(e) => handleDiscountChange(e, "minQuantity")}
                        className={`${
                          theme === 'dark' 
                            ? 'bg-blue-900/30 border-blue-700 focus:border-blue-500 focus:ring-blue-500/50' 
                            : 'bg-white border-blue-200 focus:border-blue-400'
                        } text-right`}
                      />
                      <Input
                        placeholder="نسبة الخصم %"
                        type="number"
                        min="1"
                        max="100"
                        value={newDiscount.discountPercentage}
                        onChange={(e) => handleDiscountChange(e, "discountPercentage")}
                        className={`${
                          theme === 'dark' 
                            ? 'bg-blue-900/30 border-blue-700 focus:border-blue-500 focus:ring-blue-500/50' 
                            : 'bg-white border-blue-200 focus:border-blue-400'
                        } text-right`}
                      />
                      <Button
                        type="button"
                        onClick={addDiscount}
                        className={`${
                          theme === 'dark' 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
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
                  selectedProduct ? 'تحديث المنتج' : 'إضافة المنتج'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className={`max-w-md ${theme === 'dark' ? 'bg-slate-900 border-red-800' : 'bg-white'}`}>
          <DialogHeader>
            <DialogTitle className={theme === 'dark' ? 'text-red-300' : 'text-red-700'}>
              تأكيد الحذف
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-center">
              هل أنت متأكد من حذف المنتج{" "}
              <span className="font-bold">{selectedProduct?.name}</span>؟
            </p>
            <p className="text-center text-sm text-muted-foreground mt-2">
              لا يمكن التراجع عن هذا الإجراء.
            </p>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
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
              onClick={handleDelete}
              className={`${
                theme === 'dark' 
                  ? 'bg-red-600 hover:bg-red-700 shadow-[0_0_15px_rgba(220,38,38,0.5)] hover:shadow-[0_0_20px_rgba(220,38,38,0.7)]' 
                  : 'bg-red-600 hover:bg-red-700'
              } transition-all duration-300`}
            >
              حذف المنتج
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default AdminProducts;