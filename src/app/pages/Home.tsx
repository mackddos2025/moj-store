import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          مرحباً بكم في متجر لاتكيا
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          اكتشف أحدث المنتجات بأفضل الأسعار
        </p>
        <Link
          to="/products"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          تصفح المنتجات
        </Link>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            منتجات متنوعة
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            اكتشف مجموعة واسعة من المنتجات عالية الجودة
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            توصيل سريع
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            خدمة توصيل سريعة وآمنة لجميع أنحاء المدينة
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            دعم فني
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            فريق دعم فني متاح على مدار الساعة لمساعدتك
          </p>
        </div>
      </section>
    </div>
  );
} 