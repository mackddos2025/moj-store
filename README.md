# MOJ Store - متجر إلكتروني

متجر إلكتروني متخصص في بيع أحدث المنتجات التقنية والإلكترونية بأفضل الأسعار.

## كيفية تشغيل المشروع محلياً

### المتطلبات الأساسية

- [Node.js](https://nodejs.org/) (الإصدار 14 أو أحدث)
- [npm](https://www.npmjs.com/) (يأتي مع Node.js)

### خطوات التثبيت

1. قم بنسخ المشروع إلى جهازك:

```bash
git clone https://github.com/yourusername/moj-store.git
cd moj-store
```

2. قم بتثبيت الاعتماديات:

```bash
npm install
```

3. قم بإنشاء ملف `.env` في المجلد الرئيسي وأضف متغيرات البيئة الخاصة بـ Supabase:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. قم بتشغيل خادم التطوير:

```bash
npm run dev
```

5. افتح المتصفح على العنوان التالي:

```
http://localhost:5173
```

## الميزات

- واجهة مستخدم سهلة الاستخدام باللغة العربية
- عرض المنتجات وتفاصيلها
- سلة تسوق تفاعلية
- البحث والتصفية للمنتجات
- وضع مظلم / فاتح
- تصميم متجاوب لجميع أحجام الشاشات
- تكامل مع Supabase لتخزين البيانات

## التقنيات المستخدمة

- React.js
- React Router
- Tailwind CSS
- Supabase
- Fake Store API (كبديل)
- Lucide Icons

## هيكل المشروع

```
moj-store/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── Footer.jsx
│   │   └── Navbar.jsx
│   ├── contexts/
│   │   └── CartContext.jsx
│   ├── lib/
│   │   └── supabase.js
│   ├── pages/
│   │   ├── Cart.jsx
│   │   ├── Home.jsx
│   │   ├── ProductDetails.jsx
│   │   └── Products.jsx
│   ├── App.css
│   ├── App.jsx
│   └── main.jsx
├── .env
├── .gitignore
├── index.html
├── package.json
├── README.md
├── tailwind.config.js
└── vite.config.js
```

## الاختبار

للتأكد من أن المشروع يعمل بشكل صحيح، يمكنك اختبار الوظائف التالية:

1. تصفح الصفحة الرئيسية والمنتجات
2. البحث عن منتج معين
3. تصفية المنتجات حسب الفئة والسعر
4. عرض تفاصيل المنتج
5. إضافة منتج إلى سلة التسوق
6. تعديل كمية المنتجات في السلة
7. إزالة منتج من السلة
8. إتمام عملية الشراء
9. تبديل وضع الألوان (المظلم / الفاتح)

## التطوير المستقبلي

- إضافة نظام تسجيل الدخول وإدارة الحسابات
- إضافة نظام المفضلة
- إضافة نظام التقييمات والمراجعات
- إضافة نظام الدفع الإلكتروني
- إضافة لوحة تحكم للمسؤول