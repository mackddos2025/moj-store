import React from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface Category {
  id: string;
  name: string;
  image: string;
  products: {
    id: string;
    name: string;
    price: number;
    image: string;
  }[];
}

export default function CategoriesPage() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select(`
            id,
            name,
            image,
            products (
              id,
              name,
              price,
              image_url
            )
          `);

        if (error) throw error;

        if (data) {
          // Transform the data to match the Category interface
          const transformedData = data.map(category => ({
            ...category,
            products: category.products.map(product => ({
              ...product,
              image: product.image_url
            }))
          }));
          setCategories(transformedData);
        }
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-center py-12">جاري التحميل...</div>;
  if (error) return <div className="text-center py-12 text-red-600">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">الفئات</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="relative h-48">
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <h2 className="absolute bottom-4 right-4 text-xl font-bold text-white">
                {category.name}
              </h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                {category.products.slice(0, 4).map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    className="group"
                  >
                    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover object-center group-hover:opacity-75"
                      />
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-indigo-600">
                      {product.price} ريال
                    </p>
                  </Link>
                ))}
              </div>
              {category.products.length > 4 && (
                <div className="mt-4 text-center">
                  <Link
                    to={`/categories/${category.id}`}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    عرض المزيد
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 