-- تعطيل RLS مؤقتاً
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- حذف جميع السياسات الموجودة
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable update for users based on id" ON users;
DROP POLICY IF EXISTS "Users can view their profile" ON users;
DROP POLICY IF EXISTS "Users can update their profile" ON users;
DROP POLICY IF EXISTS "Admins full access to users" ON users;

DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON categories;
DROP POLICY IF EXISTS "Public can view categories" ON categories;
DROP POLICY IF EXISTS "Admins full access to categories" ON categories;

DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON products;
DROP POLICY IF EXISTS "Public can view products" ON products;
DROP POLICY IF EXISTS "Admins full access to products" ON products;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON orders;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON orders;
DROP POLICY IF EXISTS "Users can view their orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Admins full access to orders" ON orders;

-- إضافة سياسات جديدة بسيطة
-- سياسات جدول users
CREATE POLICY "users_select_policy" ON users
    FOR SELECT USING (true);

CREATE POLICY "users_insert_policy" ON users
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "users_update_policy" ON users
    FOR UPDATE USING (auth.uid() = id);

-- سياسات جدول categories
CREATE POLICY "categories_select_policy" ON categories
    FOR SELECT USING (true);

CREATE POLICY "categories_insert_policy" ON categories
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- سياسات جدول products
CREATE POLICY "products_select_policy" ON products
    FOR SELECT USING (true);

CREATE POLICY "products_insert_policy" ON products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- سياسات جدول orders
CREATE POLICY "orders_select_policy" ON orders
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "orders_insert_policy" ON orders
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- تفعيل RLS مرة أخرى
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY; 