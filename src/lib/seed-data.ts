import { supabase } from './supabase';

export async function seedDatabase() {
  try {
    // إضافة الفئات
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .insert([
        {
          name: 'Chargers',
          image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=500&auto=format&fit=crop',
        },
        {
          name: 'Headphones',
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=500&auto=format&fit=crop',
        },
        {
          name: 'Phone Cases',
          image: 'https://images.unsplash.com/photo-1541877590-a1c8d5a2d9e9?q=80&w=500&auto=format&fit=crop',
        },
      ])
      .select();

    if (categoriesError) throw categoriesError;

    // إضافة الفئات الفرعية
    const { data: subcategories, error: subcategoriesError } = await supabase
      .from('subcategories')
      .insert([
        {
          name: '25W Chargers',
          category_id: categories[0].id,
          image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=500&auto=format&fit=crop',
        },
        {
          name: '45W Chargers',
          category_id: categories[0].id,
          image: 'https://images.unsplash.com/photo-1610792516775-01de03eae630?q=80&w=500&auto=format&fit=crop',
        },
        {
          name: 'Wireless Headphones',
          category_id: categories[1].id,
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=500&auto=format&fit=crop',
        },
        {
          name: 'Wired Headphones',
          category_id: categories[1].id,
          image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=500&auto=format&fit=crop',
        },
        {
          name: 'iPhone Cases',
          category_id: categories[2].id,
          image: 'https://images.unsplash.com/photo-1541877590-a1c8d5a2d9e9?q=80&w=500&auto=format&fit=crop',
        },
        {
          name: 'Samsung Cases',
          category_id: categories[2].id,
          image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=500&auto=format&fit=crop',
        },
      ])
      .select();

    if (subcategoriesError) throw subcategoriesError;

    // إضافة المنتجات
    const { data: products, error: productsError } = await supabase
      .from('products')
      .insert([
        {
          name: 'iPhone 14 Pro',
          description: 'Latest iPhone model with advanced features',
          price: 999,
          cost: 750,
          stock: 50,
          subcategory_id: subcategories[4].id,
          category_id: categories[2].id,
          image: 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?q=80&w=500&auto=format&fit=crop',
          is_featured: true,
        },
        {
          name: 'Samsung Galaxy S23',
          description: 'Flagship Android smartphone with premium features',
          price: 899,
          cost: 650,
          stock: 75,
          subcategory_id: subcategories[5].id,
          category_id: categories[2].id,
          image: 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?q=80&w=500&auto=format&fit=crop',
          is_featured: true,
        },
        {
          name: 'Apple Watch Series 8',
          description: 'Advanced smartwatch with health monitoring',
          price: 399,
          cost: 280,
          stock: 100,
          subcategory_id: subcategories[2].id,
          category_id: categories[1].id,
          image: 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?q=80&w=500&auto=format&fit=crop',
          is_featured: true,
        },
      ])
      .select();

    if (productsError) throw productsError;

    // إضافة الخصومات
    const { error: discountsError } = await supabase
      .from('discounts')
      .insert([
        {
          product_id: products[0].id,
          min_quantity: 5,
          discount_percentage: 5,
        },
        {
          product_id: products[0].id,
          min_quantity: 10,
          discount_percentage: 10,
        },
        {
          product_id: products[1].id,
          min_quantity: 5,
          discount_percentage: 5,
        },
        {
          product_id: products[1].id,
          min_quantity: 15,
          discount_percentage: 12,
        },
      ]);

    if (discountsError) throw discountsError;

    console.log('Database seeded successfully!');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
} 