import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [quantity, setQuantity] = React.useState(1);

  React.useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setProduct(data);
      } catch (error: any) {
        toast.error(error.message || 'حدث خطأ في جلب تفاصيل المنتج');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleQuantityChange = (value: string) => {
    const newQuantity = parseInt(value);
    if (newQuantity > 0 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity);
    } else if (newQuantity > (product?.stock || 1)) {
      toast.error(`الكمية المطلوبة تتجاوز المخزون المتاح (${product?.stock || 1})`);
    }
  };

  const addToCart = async () => {
    if (!product) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('يجب تسجيل الدخول أولاً');
        navigate('/auth/login');
        return;
      }

      // Check if the requested quantity is available
      if (quantity > product.stock) {
        toast.error(`الكمية المطلوبة (${quantity}) تتجاوز المخزون المتاح (${product.stock})`);
        return;
      }

      // Check if product is already in cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .single();

      if (existingItem) {
        // Check if adding the new quantity would exceed stock
        if (existingItem.quantity + quantity > product.stock) {
          toast.error(`الكمية الإجمالية تتجاوز المخزون المتاح (${product.stock})`);
          return;
        }

        // Update existing item
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);

        if (updateError) throw updateError;
      } else {
        // Add new item
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity: quantity
          });

        if (insertError) throw insertError;
      }

      toast.success('تمت إضافة المنتج إلى السلة');
      navigate('/cart');
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ في إضافة المنتج إلى السلة');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">المنتج غير موجود</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-96 object-cover rounded-lg"
          />
        </div>
        
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-6">{product.description}</p>
          <p className="text-blue-600 font-bold text-2xl mb-6">
            {Number(product.price).toLocaleString('ar-SY')} ل.س
          </p>
          
          <div className="flex items-center space-x-4 mb-6">
            <label htmlFor="quantity" className="text-gray-600">الكمية:</label>
            <div className="flex items-center border rounded">
              <button
                onClick={() => handleQuantityChange((quantity - 1).toString())}
                className="px-3 py-1 hover:bg-gray-100"
                disabled={quantity <= 1}
              >
                -
              </button>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                min="1"
                max={product?.stock || 1}
                className="w-16 text-center border-x px-2 py-1 focus:outline-none"
              />
              <button
                onClick={() => handleQuantityChange((quantity + 1).toString())}
                className="px-3 py-1 hover:bg-gray-100"
                disabled={quantity >= (product?.stock || 1)}
              >
                +
              </button>
            </div>
            <span className="text-sm text-gray-500">المخزون المتاح: {product?.stock || 0}</span>
          </div>

          <button
            onClick={addToCart}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            إضافة إلى السلة
          </button>
        </div>
      </div>
    </div>
  );
} 