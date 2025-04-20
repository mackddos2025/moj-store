-- سياسات الوصول للمستخدمين (Users)
-- السماح للمستخدمين برؤية ملفاتهم الشخصية فقط
CREATE POLICY "Users can view their profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- السماح للمستخدمين بتحديث ملفاتهم الشخصية فقط
CREATE POLICY "Users can update their profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- السماح للمديرين فقط بإنشاء حسابات جديدة
CREATE POLICY "Only admins can create users"
  ON users FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- السماح للمديرين فقط بالوصول الكامل للمستخدمين
CREATE POLICY "Admins full access to users"
  ON users FOR ALL
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- منع المستخدمين العاديين من حذف حساباتهم
CREATE POLICY "Only admins can delete users"
  ON users FOR DELETE
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ========== تنظيف السياسات الحالية ==========
-- إسقاط جميع السياسات الحالية لجدول users
DROP POLICY IF EXISTS "Users can view their profile" ON users;
DROP POLICY IF EXISTS "Users can update their profile" ON users;
DROP POLICY IF EXISTS "Only admins can create users" ON users;
DROP POLICY IF EXISTS "Admins full access to users" ON users;
DROP POLICY IF EXISTS "Only admins can delete users" ON users;
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "users_delete_policy" ON users;

-- ========== تعطيل RLS مؤقتاً ==========
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- ========== إضافة السياسات الجديدة ==========
-- سياسة القراءة للمستخدمين
CREATE POLICY "users_select_policy"
  ON users FOR SELECT
  USING (
    auth.uid() = id OR
    (
      auth.role() = 'authenticated' AND
      EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

-- سياسة الإضافة للمديرين فقط
CREATE POLICY "users_insert_policy"
  ON users FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- سياسة التحديث للمستخدمين والمديرين
CREATE POLICY "users_update_policy"
  ON users FOR UPDATE
  USING (
    auth.uid() = id OR
    (
      auth.role() = 'authenticated' AND
      EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

-- سياسة الحذف للمديرين فقط
CREATE POLICY "users_delete_policy"
  ON users FOR DELETE
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ========== إعادة تفعيل RLS ==========
ALTER TABLE users ENABLE ROW LEVEL SECURITY; 