-- إضافة بيانات تجريبية للفئات
INSERT INTO categories (name, image) VALUES
('أجهزة إلكترونية', 'https://example.com/electronics.jpg'),
('ملابس', 'https://example.com/clothing.jpg'),
('أثاث', 'https://example.com/furniture.jpg');

-- إضافة بيانات تجريبية للفئات الفرعية
INSERT INTO subcategories (name, category_id, image) VALUES
('هواتف', (SELECT id FROM categories WHERE name = 'أجهزة إلكترونية'), 'https://example.com/phones.jpg'),
('أجهزة كمبيوتر', (SELECT id FROM categories WHERE name = 'أجهزة إلكترونية'), 'https://example.com/computers.jpg'),
('ملابس رجالية', (SELECT id FROM categories WHERE name = 'ملابس'), 'https://example.com/mens.jpg'),
('ملابس نسائية', (SELECT id FROM categories WHERE name = 'ملابس'), 'https://example.com/womens.jpg');

-- إضافة بيانات تجريبية للمنتجات
INSERT INTO products (name, description, price, cost, stock, subcategory_id, category_id, image) VALUES
('iPhone 13', 'هاتف آيفون 13', 2999.99, 2500.00, 50, 
 (SELECT id FROM subcategories WHERE name = 'هواتف'),
 (SELECT id FROM categories WHERE name = 'أجهزة إلكترونية'),
 'https://example.com/iphone13.jpg'),

('MacBook Pro', 'لابتوب ماك بوك برو', 5999.99, 5000.00, 30,
 (SELECT id FROM subcategories WHERE name = 'أجهزة كمبيوتر'),
 (SELECT id FROM categories WHERE name = 'أجهزة إلكترونية'),
 'https://example.com/macbook.jpg'),

('قميص رجالي', 'قميص قطني', 199.99, 150.00, 100,
 (SELECT id FROM subcategories WHERE name = 'ملابس رجالية'),
 (SELECT id FROM categories WHERE name = 'ملابس'),
 'https://example.com/shirt.jpg');

-- إضافة مستخدم تجريبي
INSERT INTO users (id, name, email, phone, role) VALUES
('00000000-0000-0000-0000-000000000000', 'مستخدم تجريبي', 'test@example.com', '0123456789', 'customer');

-- إضافة طلب تجريبي
INSERT INTO orders (user_id, status, total) VALUES
('00000000-0000-0000-0000-000000000000', 'pending', 3199.98);

-- إضافة تفاصيل الطلب
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
((SELECT id FROM orders LIMIT 1),
 (SELECT id FROM products WHERE name = 'iPhone 13'),
 1,
 2999.99); 