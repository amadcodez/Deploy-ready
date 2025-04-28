import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// Generate random Order ID
function generateOrderID(length = 8) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let orderId = '';
  for (let i = 0; i < length; i++) {
    orderId += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return orderId;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const client = await clientPromise;
    const db = client.db('myDBClass');
    const orders = db.collection('orders');

    const fullOrder = {
      ...body,
      orderID: generateOrderID(), // 🛒 add orderID
    };

    await orders.insertOne(fullOrder);

    return new NextResponse(JSON.stringify({ success: true, orderID: fullOrder.orderID }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Order Save Error:', error);
    return new NextResponse(JSON.stringify({ success: false }), { status: 500 });
  }
}
