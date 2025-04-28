'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        setProduct(data);

        const relRes = await fetch('/api/products');
        const allProducts = await relRes.json();
        const filtered = allProducts.filter((p: any) => p._id !== id);
        setRelatedProducts(filtered.slice(0, 4));
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    const cartItem = {
      id: product._id,
      title: product.itemName,
      price: product.itemPrice,
      image: product.itemImages?.[0],
      quantity: 1,
      storeID: product.storeID, // ✅ attach storeID here
    };
  
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    existingCart.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(existingCart));
  
    router.push('/cart');
  };
  

  const handleBuyNow = () => {
    const item = {
      id: product._id,
      title: product.itemName,
      price: product.itemPrice,
      image: product.itemImages?.[0],
      quantity: 1,
      storeID: product.storeID, // ✅ also here
    };
  
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const alreadyExists = existingCart.find((i: any) => i.id === item.id);
  
    if (!alreadyExists) {
      existingCart.push(item);
    }
  
    localStorage.setItem('cart', JSON.stringify(existingCart));
    router.push('/checkout');
  };
  

  if (!product) return <p className="text-center mt-20">Loading product...</p>;

  return (
    <div>
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="relative group overflow-hidden">
          <img
            src={product.itemImages?.[0] || '/images/placeholder.png'}
            alt={product.itemName}
            className="w-full rounded-lg shadow object-cover h-[500px] transform transition-transform duration-300 group-hover:scale-105 cursor-zoom-in"
          />
          <div className="flex gap-2 mt-4">
            {(product.itemImages || []).map((img: string, index: number) => (
              <img
                key={index}
                src={img || '/images/placeholder.png'}
                alt={`Thumbnail ${index + 1}`}
                className="h-20 w-20 object-cover rounded border border-gray-200 hover:border-pink-500 cursor-pointer"
              />
            ))}
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">{product.itemName}</h1>
          <p className="text-gray-500 text-sm mb-2">Product ID: {product._id}</p>

          <div className="flex items-center gap-4 mb-4">
            <span className="text-3xl font-bold text-pink-600">Rs.{product.itemPrice}</span>
            {product.compareAtPrice && product.compareAtPrice > product.itemPrice && (
              <span className="text-xl line-through text-gray-400">{product.compareAtPrice}</span>
            )}
          </div>

          <p className="text-md text-gray-700 leading-relaxed mb-6">
            {product.itemDescription || 'No description available.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <button
              onClick={handleAddToCart}
              className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-6 rounded shadow"
            >
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="border border-pink-600 text-pink-600 hover:bg-pink-50 font-semibold py-3 px-6 rounded shadow"
            >
              Buy Now
            </button>
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <p>🚚 Free delivery available</p>
            <p>✅ Return policy: 7-day easy return</p>
            <p>🔒 Secure checkout</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Write a Review</h2>
        <form className="space-y-4">
          <input
            type="text"
            placeholder="Your name"
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none"
          />
          <textarea
            rows={4}
            placeholder="Your review..."
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none"
          ></textarea>
          <button className="bg-pink-600 text-white px-6 py-2 rounded hover:bg-pink-700">
            Submit Review
          </button>
        </form>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Related Products</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {relatedProducts.map((item: any) => (
            <Link key={item._id} href={`/product/${item._id}`}>
              <div className="border rounded-lg p-4 shadow hover:shadow-md transition">
                <img
                  src={item.itemImages?.[0] || '/images/placeholder.png'}
                  alt={item.itemName}
                  className="h-40 w-full object-cover rounded mb-3"
                />
                <h3 className="text-sm font-semibold text-gray-700 truncate">{item.itemName}</h3>
                <p className="text-pink-600 font-bold mt-1">Rs.{item.itemPrice}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <footer className="bg-[#212121] text-white py-12 px-6 md:px-16 mt-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3">MultiVendor</h3>
            <p className="text-sm">Your one-stop shop for all vendor products, best deals and fast delivery.</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-3">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li>Shop</li>
              <li>Sell with Us</li>
              <li>Deals</li>
              <li>Vendors</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-3">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>Help Center</li>
              <li>Shipping</li>
              <li>Returns</li>
              <li>Privacy</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-3">Connect</h3>
            <ul className="space-y-2 text-sm">
              <li>Instagram</li>
              <li>Facebook</li>
              <li>Twitter</li>
              <li>YouTube</li>
            </ul>
          </div>
        </div>
        <p className="text-center text-sm text-gray-400 mt-10">&copy; 2025 MultiVendor. All rights reserved.</p>
      </footer>
    </div>
  );
}
