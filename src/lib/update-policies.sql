-- تعطيل RLS مؤقتاً على جميع الجداول
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE discounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

-- حذف جميع السياسات الحالية
DROP POLICY IF EXISTS "Public can view categories" ON categories;
DROP POLICY IF EXISTS "Admins full access to categories" ON categories;
DROP POLICY IF EXISTS "Public can view subcategories" ON subcategories;
DROP POLICY IF EXISTS "Admins full access to subcategories" ON subcategories;
DROP POLICY IF EXISTS "Public can view products" ON products;
DROP POLICY IF EXISTS "Admins full access to products" ON products;
DROP POLICY IF EXISTS "Users can view their orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Admins full access to orders" ON orders;
DROP POLICY IF EXISTS "Users can view their profile" ON users;
DROP POLICY IF EXISTS "Users can update their profile" ON users;
DROP POLICY IF EXISTS "Admins full access to users" ON users;

-- إضافة سياسات جديدة
-- سياسات جدول categories
CREATE POLICY "Public can view categories"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Admins full access to categories"
  ON categories FOR ALL
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- سياسات جدول subcategories
CREATE POLICY "Public can view subcategories"
  ON subcategories FOR SELECT
  USING (true);

CREATE POLICY "Admins full access to subcategories"
  ON subcategories FOR ALL
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- سياسات جدول products
CREATE POLICY "Public can view products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Admins full access to products"
  ON products FOR ALL
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- سياسات جدول orders
CREATE POLICY "Users can view their orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins full access to orders"
  ON orders FOR ALL
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- سياسات جدول users
CREATE POLICY "Users can view their profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins full access to users"
  ON users FOR ALL
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- تفعيل RLS مرة أخرى
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY; 