import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

// الصفحات
import Home from '@/app/home/page';
import Login from '@/app/auth/login/page';
import Register from '@/app/auth/register/page';
import Products from '@/app/products/page';
import ProductDetails from '@/app/products/[id]/page';
import Cart from '@/app/cart/page';
import Checkout from '@/app/checkout/page';
import Orders from '@/app/orders/page';
import Categories from '@/app/categories/page';
import CategoryDetails from '@/app/categories/[id]/page';

// صفحات لوحة التحكم
import AdminDashboard from '@/app/admin/page';
import AdminProducts from '@/app/admin/products/page';
import AdminCategories from '@/app/admin/categories/page';
import AdminOrders from '@/app/admin/orders/page';
import AdminUsers from '@/app/admin/users/page';
import AdminNotifications from '@/app/admin/notifications/page';
import AdminReports from '@/app/admin/reports/page';
import AdminSettings from '@/app/admin/settings/page';

// المكونات
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Toaster 
        position="top-right"
        richColors
        closeButton
        expand={false}
        duration={3000}
        theme="light"
      />
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* الصفحات العامة */}
          <Route path="/" element={<Home />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/:id" element={<CategoryDetails />} />

          {/* صفحات لوحة التحكم */}
          <Route path="/admin">
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* إعادة التوجيه */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
} 