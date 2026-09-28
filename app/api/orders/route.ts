import { AS_OF, START, generateOrders } from '@/lib/orders';

export function GET() {
  return Response.json({ synthetic: true, start: START, asOf: AS_OF, orders: generateOrders() });
}
