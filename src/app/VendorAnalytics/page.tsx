'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Chart from 'chart.js/auto';
import { ShoppingBag, DollarSign, Package, Star } from 'lucide-react';

export default function VendorAnalytics() {
  const router = useRouter();
  const chartRef = useRef<Chart | null>(null);

  const [storeID, setStoreID] = useState<string | null>(null);
  const [ordersArray, setOrdersArray] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  // ✅ 1. Check storeID and Redirect if not found
  useEffect(() => {
    const stored = localStorage.getItem('storeID');
    if (!stored) {
      router.replace('/Login');
    } else {
      setStoreID(stored);
    }
  }, [router]);

  // ✅ 2. Fetch orders safely
  useEffect(() => {
    if (!storeID) return;

    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/vendor-orders?storeID=${storeID}`);
        const data = await res.json();
        if (data.success) {
          setOrdersArray(data.orders);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      }
    };

    fetchOrders();
  }, [storeID]);

  // ✅ 3. Chart Drawing safely
  useEffect(() => {
    if (!storeID) return;
    if (!ordersArray.length) return;

    const dailyRevenue: { [key: string]: number } = {};
    const dailyItemsSold: { [key: string]: number } = {};

    ordersArray.forEach((order: any) => {
      const date = new Date(order.date);
      const dateStr = date.toISOString().split('T')[0];

      if (!dailyRevenue[dateStr]) {
        dailyRevenue[dateStr] = 0;
        dailyItemsSold[dateStr] = 0;
      }

      order.cartItems.forEach((item: any) => {
        dailyRevenue[dateStr] += item.price * item.quantity;
        dailyItemsSold[dateStr] += item.quantity;
      });
    });

    const dates = Object.keys(dailyRevenue).sort();

    const ctx = document.getElementById('salesChart') as HTMLCanvasElement | null;
    if (ctx) {
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      chartRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: dates,
          datasets: [
            {
              label: 'Revenue (Rs.)',
              data: dates.map(date => dailyRevenue[date]),
              borderColor: '#3B82F6',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              tension: 0.4,
            },
            {
              label: 'Items Sold',
              data: dates.map(date => dailyItemsSold[date]),
              borderColor: '#22C55E',
              backgroundColor: 'rgba(34, 197, 94, 0.2)',
              tension: 0.4,
            }
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true },
          },
        },
      });
    }
  }, [ordersArray, storeID]);

  // ✅ 4. Calculate Analytics
  const matchingOrders = ordersArray.filter((order: any) =>
    order.cartItems.some((item: any) => item.storeID === storeID)
  );

  const getFilteredOrders = () => {
    if (filter === '7days') {
      return matchingOrders.filter((order: any) => new Date(order.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    } else if (filter === '30days') {
      return matchingOrders.filter((order: any) => new Date(order.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    }
    return matchingOrders;
  };

  const filteredOrders = getFilteredOrders();

  let totalOrders = filteredOrders.length;
  let revenue = 0;
  let itemsSold = 0;
  const productSales: { [title: string]: { quantity: number; price: number; firstSoldDate: Date } } = {};

  filteredOrders.forEach((order: any) => {
    const orderDate = new Date(order.date);

    order.cartItems.forEach((item: any) => {
      if (item.storeID === storeID) {
        revenue += item.price * item.quantity;
        itemsSold += item.quantity;

        if (!productSales[item.title]) {
          productSales[item.title] = { quantity: 0, price: item.price, firstSoldDate: orderDate };
        }

        productSales[item.title].quantity += item.quantity;

        if (orderDate < productSales[item.title].firstSoldDate) {
          productSales[item.title].firstSoldDate = orderDate;
        }
      }
    });
  });

  const bestSellerFull = Object.entries(productSales).sort((a, b) => b[1].quantity - a[1].quantity)[0]?.[0] || 'N/A';
  const bestSeller = bestSellerFull.length > 20 ? bestSellerFull.slice(0, 20) + '...' : bestSellerFull;

  const bestSellingItems = Object.entries(productSales)
    .sort((a, b) => b[1].quantity - a[1].quantity)
    .map(([title, details]) => ({
      title,
      quantity: details.quantity,
      price: details.price,
      firstSoldDate: details.firstSoldDate,
    }));

  // ✅ 5. Render only if storeID exists
  if (!storeID) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-neutral-800 mb-8">
        Vendor Analytics
      </h1>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Orders" value={totalOrders} icon={<ShoppingBag className="h-7 w-7 text-indigo-500" />} />
        <StatCard title="Revenue" value={`Rs. ${revenue}`} icon={<DollarSign className="h-7 w-7 text-green-500" />} />
        <StatCard title="Items Sold" value={itemsSold} icon={<Package className="h-7 w-7 text-blue-500" />} />
        <StatCard title="Best Seller" value={bestSeller} icon={<Star className="h-7 w-7 text-yellow-500" />} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <FilterButton label="Last 7 Days" active={filter === '7days'} onClick={() => setFilter('7days')} />
        <FilterButton label="Last 30 Days" active={filter === '30days'} onClick={() => setFilter('30days')} />
        <FilterButton label="All Time" active={filter === 'all'} onClick={() => setFilter('all')} />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow p-6 border mb-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Sales Overview</h2>
        <div className="h-80">
          <canvas id="salesChart"></canvas>
        </div>
      </div>

      {/* Best Selling Items */}
      <div className="bg-white rounded-xl shadow p-6 border">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Best Selling Items</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-800">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-black uppercase">Item Name</th>
                <th className="px-4 py-2 text-left font-semibold text-black uppercase">Total Sold</th>
                <th className="px-4 py-2 text-left font-semibold text-black uppercase">Price</th>
                <th className="px-4 py-2 text-left font-semibold text-black uppercase">First Sold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bestSellingItems.map((item, index) => (
                <tr key={index} className="hover:bg-gray-100 transition">
                  <td className="px-4 py-3">{item.title.length > 40 ? item.title.slice(0, 40) + '...' : item.title}</td>
                  <td className="px-4 py-3">{item.quantity}</td>
                  <td className="px-4 py-3">Rs. {item.price}</td>
                  <td className="px-4 py-3">{item.firstSoldDate.toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Subcomponents
function StatCard({ title, value, icon }: { title: string; value: any; icon: JSX.Element }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center hover:shadow-lg transition duration-300 text-center">
      <div className="mb-2">{icon}</div>
      <h2 className="text-base font-semibold text-gray-700 mb-1">{title}</h2>
      <p className="text-xl font-bold text-gray-800 truncate w-40">{value}</p>
    </div>
  );
}

function FilterButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full border ${
        active ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-blue-50'
      } transition`}
    >
      {label}
    </button>
  );
}
