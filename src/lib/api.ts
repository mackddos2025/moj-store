import {
  getCategories,
  getSubcategories,
  getProducts,
  getOrders,
  getUsers,
  createCategory,
  createSubcategory,
  createProduct,
  createOrder,
  createUser,
  signUp,
  signIn,
  signOut,
  type Category,
  type Subcategory,
  type Product,
  type Order,
  type User
} from './supabase';
import { User } from './stores/auth-store';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Define a type for the database user that includes password
export type DbUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'admin' | 'customer';
  telegramId?: string;
};

// API functions
export const api = {
  // Categories
  getCategories: async () => {
    await delay(500);
    return getCategories();
  },
  createCategory: async (category: Omit<Category, 'id' | 'created_at'>) => {
    await delay(500);
    return createCategory(category);
  },

  // Subcategories
  getSubcategories: async () => {
    await delay(500);
    return getSubcategories();
  },
  createSubcategory: async (subcategory: Omit<Subcategory, 'id' | 'created_at'>) => {
    await delay(500);
    return createSubcategory(subcategory);
  },

  // Products
  getProducts: async () => {
    await delay(500);
    return getProducts();
  },
  createProduct: async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    await delay(500);
    return createProduct(product);
  },

  // Orders
  getOrders: async () => {
    await delay(500);
    return getOrders();
  },
  createOrder: async (order: Omit<Order, 'id' | 'created_at'>) => {
    await delay(500);
    return createOrder(order);
  },

  // Users
  getUsers: async () => {
    await delay(500);
    return getUsers();
  },
  createUser: async (user: Omit<User, 'id' | 'created_at'>) => {
    await delay(500);
    return createUser(user);
  },

  // Auth
  signUp: async (email: string, password: string, userData: Omit<User, 'id' | 'created_at'>) => {
    await delay(500);
    return signUp(email, password, userData);
  },
  signIn: async (email: string, password: string) => {
    await delay(500);
    return signIn(email, password);
  },
  signOut: async () => {
    await delay(500);
    return signOut();
  },

  // Auth
  login: async (email: string, password: string): Promise<{ user: User; token: string } | null> => {
    await delay(500);
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return null;
    
    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword as User,
      token: 'mock-jwt-token',
    };
  },
  
  getCategoryById: async (id: string): Promise<Category | undefined> => {
    await delay(200);
    return categories.find(category => category.id === id);
  },
  
  getSubcategoriesByCategoryId: async (categoryId: string): Promise<Subcategory[]> => {
    await delay(300);
    return subcategories.filter(subcategory => subcategory.categoryId === categoryId);
  },
  
  getSubcategoryById: async (id: string): Promise<Subcategory | undefined> => {
    await delay(200);
    return subcategories.find(subcategory => subcategory.id === id);
  },
  
  getProductsBySubcategoryId: async (subcategoryId: string): Promise<Product[]> => {
    await delay(500);
    return products.filter(product => product.subcategoryId === subcategoryId);
  },
  
  getProductById: async (id: string): Promise<Product | undefined> => {
    await delay(300);
    return products.find(product => product.id === id);
  },
  
  getFeaturedProducts: async (): Promise<Product[]> => {
    await delay(400);
    // Return the newest products first
    return [...products]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  },
  
  getOrderById: async (id: string): Promise<Order | undefined> => {
    await delay(400);
    return orders.find(order => order.id === id);
  },
  
  updateOrderStatus: async (orderId: string, status: Order['status'], expectedDeliveryTime?: string): Promise<Order> => {
    await delay(500);
    
    const orderIndex = orders.findIndex(order => order.id === orderId);
    if (orderIndex === -1) {
      throw new Error('Order not found');
    }
    
    const updatedOrder = {
      ...orders[orderIndex],
      status,
      ...(expectedDeliveryTime ? { expectedDeliveryTime } : {}),
    };
    
    orders[orderIndex] = updatedOrder;
    
    return updatedOrder;
  },
  
  updateUser: async (userId: string, userData: Partial<Omit<DbUser, 'id'>>): Promise<User> => {
    await delay(500);
    
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    const updatedUser = {
      ...users[userIndex],
      ...userData,
    };
    
    users[userIndex] = updatedUser;
    
    // Return user without password
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  },
  
  updateProduct: async (id: string, productData: Partial<Product>, imageFile?: File): Promise<Product> => {
    await delay(600);
    
    const productIndex = products.findIndex(product => product.id === id);
    if (productIndex === -1) {
      throw new Error('Product not found');
    }
    
    let imageUrl = productData.image || products[productIndex].image;
    
    if (imageFile) {
      // Convert image to Base64
      const reader = new FileReader();
      imageUrl = await new Promise((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(imageFile);
      });
    }
    
    const updatedProduct = {
      ...products[productIndex],
      ...productData,
      image: imageUrl,
    };
    
    products[productIndex] = updatedProduct;
    saveProducts(products);
    
    return updatedProduct;
  },
  
  deleteProduct: async (id: string): Promise<void> => {
    await delay(500);
    
    const productIndex = products.findIndex(product => product.id === id);
    if (productIndex === -1) {
      throw new Error('Product not found');
    }
    
    products.splice(productIndex, 1);
    saveProducts(products);
  },
  
  updateCategory: async (id: string, categoryData: Partial<Category>, imageFile?: File): Promise<Category> => {
    await delay(400);
    
    const categoryIndex = categories.findIndex(category => category.id === id);
    if (categoryIndex === -1) {
      throw new Error('Category not found');
    }
    
    let imageUrl = categoryData.image || categories[categoryIndex].image;
    
    if (imageFile) {
      // Convert image to Base64
      const reader = new FileReader();
      imageUrl = await new Promise((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(imageFile);
      });
    }
    
    const updatedCategory = {
      ...categories[categoryIndex],
      ...categoryData,
      image: imageUrl,
    };
    
    categories[categoryIndex] = updatedCategory;
    saveCategories(categories);
    
    return updatedCategory;
  },
  
  deleteCategory: async (id: string): Promise<void> => {
    await delay(400);
    
    const categoryIndex = categories.findIndex(category => category.id === id);
    if (categoryIndex === -1) {
      throw new Error('Category not found');
    }
    
    categories.splice(categoryIndex, 1);
    saveCategories(categories);
  },
  
  updateSubcategory: async (id: string, subcategoryData: Partial<Subcategory>, imageFile?: File): Promise<Subcategory> => {
    await delay(400);
    
    const subcategoryIndex = subcategories.findIndex(subcategory => subcategory.id === id);
    if (subcategoryIndex === -1) {
      throw new Error('Subcategory not found');
    }
    
    let imageUrl = subcategoryData.image || subcategories[subcategoryIndex].image;
    
    if (imageFile) {
      // Convert image to Base64
      const reader = new FileReader();
      imageUrl = await new Promise((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(imageFile);
      });
    }
    
    const updatedSubcategory = {
      ...subcategories[subcategoryIndex],
      ...subcategoryData,
      image: imageUrl,
    };
    
    subcategories[subcategoryIndex] = updatedSubcategory;
    saveSubcategories(subcategories);
    
    return updatedSubcategory;
  },
  
  deleteSubcategory: async (id: string): Promise<void> => {
    await delay(400);
    
    const subcategoryIndex = subcategories.findIndex(subcategory => subcategory.id === id);
    if (subcategoryIndex === -1) {
      throw new Error('Subcategory not found');
    }
    
    subcategories.splice(subcategoryIndex, 1);
    saveSubcategories(subcategories);
  },
  
  addProductDiscount: async (productId: string, discount: Omit<Discount, 'id' | 'productId'>): Promise<Product> => {
    await delay(500);
    
    const productIndex = products.findIndex(product => product.id === productId);
    if (productIndex === -1) {
      throw new Error('Product not found');
    }
    
    const newDiscount = {
      id: `discount-${Date.now()}`,
      productId,
      ...discount,
    };
    
    const product = products[productIndex];
    const updatedProduct = {
      ...product,
      discounts: [...(product.discounts || []), newDiscount],
    };
    
    products[productIndex] = updatedProduct;
    
    return updatedProduct;
  },
  
  removeProductDiscount: async (productId: string, discountId: string): Promise<Product> => {
    await delay(400);
    
    const productIndex = products.findIndex(product => product.id === productId);
    if (productIndex === -1) {
      throw new Error('Product not found');
    }
    
    const product = products[productIndex];
    if (!product.discounts) {
      throw new Error('Product has no discounts');
    }
    
    const updatedProduct = {
      ...product,
      discounts: product.discounts.filter(discount => discount.id !== discountId),
    };
    
    products[productIndex] = updatedProduct;
    
    return updatedProduct;
  },
  
  sendTelegramNotification: async (userId: string, message: string): Promise<boolean> => {
    await delay(300);
    
    const user = users.find(u => u.id === userId);
    if (!user || !user.telegramId) {
      return false;
    }
    
    // In a real app, we would send a message to the Telegram bot API
    console.log(`Sending Telegram notification to ${user.telegramId}: ${message}`);
    
    return true;
  },
};