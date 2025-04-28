'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ThankYouPage() {
  const [orderID, setOrderID] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // ✅ Add loading state

  useEffect(() => {
    const id = localStorage.getItem('orderID');
    setOrderID(id);

    // ✅ Remove orderID after 2 mins
    setTimeout(() => {
      localStorage.removeItem('orderID');
    }, 20000);

    // ✅ Set loading false after checking localStorage
    setLoading(false);
  }, []);

  if (loading) {
    // ✅ Jab tak localStorage check nahi hota kuch mat dikhao
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      {orderID ? (
        <>
          <h1 className="text-4xl font-bold text-green-600 mb-4 flex items-center gap-2">
            🎉 Thank You!
          </h1>
          <p className="text-lg text-gray-700 mb-8 text-center">
            Your order has been placed successfully.
          </p>

          <div className="bg-white shadow-md p-6 rounded-md w-full max-w-md text-center">
            <p className="text-gray-700 mb-4 text-sm">
              <span className="font-semibold text-gray-900">Your Order ID:</span> <span className="font-bold text-black">{orderID}</span>
            </p>

            <h2 className="text-lg font-semibold mb-2 text-gray-800">What’s Next?</h2>
            <ul className="list-disc list-inside text-gray-600 text-left space-y-1 text-sm">
              <li>You'll receive a confirmation call or message soon.</li>
              <li>If you paid online, your payment will be verified.</li>
              <li>Your order will be dispatched shortly.</li>
            </ul>
          </div>

          <Link
            href="/"
            className="mt-8 inline-block px-6 py-3 bg-black text-white rounded-md font-semibold hover:bg-gray-900 transition"
          >
            Go Back to Home
          </Link>
        </>
      ) : (
        <>
          {/* Visitor without orderID */}
          <h1 className="text-4xl font-bold text-gray-700 mb-4 flex items-center gap-2">
            🙏 Thank You for Visiting!
          </h1>
          <p className="text-lg text-gray-600 mb-8 text-center">
            We would love to thank you if you buy anything from us.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-black text-white rounded-md font-semibold hover:bg-gray-900 transition"
          >
            Go Back to Home
          </Link>
        </>
      )}
    </div>
  );
}
