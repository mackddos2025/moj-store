-- إضافة فئات رئيسية
INSERT INTO categories (name, image) VALUES
('أجهزة إلكترونية', 'https://example.com/electronics.jpg'),
('ملابس', 'https://example.com/clothing.jpg'),
('أثاث', 'https://example.com/furniture.jpg'),
('أدوات منزلية', 'https://example.com/home.jpg'),
('ألعاب', 'https://example.com/toys.jpg');

-- إضافة فئات فرعية
INSERT INTO subcategories (name, category_id, image) VALUES
-- فئات فرعية للأجهزة الإلكترونية
('هواتف', (SELECT id FROM categories WHERE name = 'أجهزة إلكترونية'), 'https://example.com/phones.jpg'),
('أجهزة كمبيوتر', (SELECT id FROM categories WHERE name = 'أجهزة إلكترونية'), 'https://example.com/computers.jpg'),
('أجهزة منزلية', (SELECT id FROM categories WHERE name = 'أجهزة إلكترونية'), 'https://example.com/home-electronics.jpg'),

-- فئات فرعية للملابس
('ملابس رجالية', (SELECT id FROM categories WHERE name = 'ملابس'), 'https://example.com/mens.jpg'),
('ملابس نسائية', (SELECT id FROM categories WHERE name = 'ملابس'), 'https://example.com/womens.jpg'),
('ملابس أطفال', (SELECT id FROM categories WHERE name = 'ملابس'), 'https://example.com/kids.jpg'),

-- فئات فرعية للأثاث
('غرف نوم', (SELECT id FROM categories WHERE name = 'أثاث'), 'https://example.com/bedroom.jpg'),
('غرف معيشة', (SELECT id FROM categories WHERE name = 'أثاث'), 'https://example.com/living.jpg'),
('مطابخ', (SELECT id FROM categories WHERE name = 'أثاث'), 'https://example.com/kitchen.jpg');

-- إضافة منتجات
INSERT INTO products (name, description, price, cost, stock, subcategory_id, category_id, image, is_featured) VALUES
-- منتجات إلكترونية
('iPhone 13', 'هاتف آيفون 13 مع شاشة OLED', 2999.99, 2500.00, 50,
 (SELECT id FROM subcategories WHERE name = 'هواتف'),
 (SELECT id FROM categories WHERE name = 'أجهزة إلكترونية'),
 'https://example.com/iphone13.jpg', true),

('MacBook Pro', 'لابتوب ماك بوك برو مع شاشة Retina', 5999.99, 5000.00, 30,
 (SELECT id FROM subcategories WHERE name = 'أجهزة كمبيوتر'),
 (SELECT id FROM categories WHERE name = 'أجهزة إلكترونية'),
 'https://example.com/macbook.jpg', true),

-- منتجات ملابس
('قميص رجالي', 'قميص قطني عالي الجودة', 199.99, 150.00, 100,
 (SELECT id FROM subcategories WHERE name = 'ملابس رجالية'),
 (SELECT id FROM categories WHERE name = 'ملابس'),
 'https://example.com/shirt.jpg', false),

('فستان نسائي', 'فستان أنيق للمناسبات', 399.99, 300.00, 50,
 (SELECT id FROM subcategories WHERE name = 'ملابس نسائية'),
 (SELECT id FROM categories WHERE name = 'ملابس'),
 'https://example.com/dress.jpg', true);

-- إضافة خصومات
INSERT INTO discounts (product_id, min_quantity, discount_percentage) VALUES
((SELECT id FROM products WHERE name = 'iPhone 13'), 2, 10.00),
((SELECT id FROM products WHERE name = 'MacBook Pro'), 1, 5.00);

-- إضافة مستخدم مسؤول
INSERT INTO users (id, name, email, phone, role) VALUES
('00000000-0000-0000-0000-000000000000', 'المسؤول', 'admin@example.com', '0123456789', 'admin'); 