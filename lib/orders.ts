export const AS_OF = '2026-08-31';
export const START = '2026-03-01';
export type Order = {
  id: string; date: string; customer: string; category: string; items: number;
  revenue: number; cost: number; margin: number; promisedDate: string;
  deliveredDate: string | null;
  status: 'Delivered' | 'Processing' | 'In Transit' | 'Cancelled';
};
const DAY = 86400000;
const iso = (time: number) => new Date(time).toISOString().slice(0, 10);

/** Fixed seed and UTC dates make this historical demo repeatable. Amounts are EUR. */
export function generateOrders(): Order[] {
  let seed = 20260831;
  const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  const categories = ['Electronics', 'Office', 'Apparel', 'Industrial'];
  const start = Date.parse(START);
  const end = Date.parse(AS_OF);
  return Array.from({ length: 1000 }, (_, i) => {
    const time = start + Math.floor(random() * 184) * DAY;
    const categoryIndex = Math.floor(random() * 4);
    const items = 1 + Math.floor(random() * 20);
    const revenue = items * [120, 25, 45, 180][categoryIndex];
    const cost = Math.round(revenue * (0.55 + random() * 0.3) * 100) / 100;
    const promised = time + (3 + Math.floor(random() * 5)) * DAY;
    const actual = promised + (random() < 0.2 ? 2 : -1) * DAY;
    const status: Order['status'] = random() < 0.06 ? 'Cancelled' : actual <= end ? 'Delivered' : time + 2 * DAY <= end ? 'In Transit' : 'Processing';
    return {
      id: `ORD-${1000 + i}`, date: iso(time), customer: `Demo Company ${1 + Math.floor(random() * 60)}`,
      category: categories[categoryIndex], items, revenue, cost,
      margin: Math.round((revenue - cost) / revenue * 1000) / 10,
      promisedDate: iso(promised), deliveredDate: status === 'Delivered' ? iso(actual) : null, status,
    };
  }).sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}

export function summarize(orders: Order[]) {
  const delivered = orders.filter(o => o.status === 'Delivered');
  const revenueCents = delivered.reduce((sum, o) => sum + Math.round(o.revenue * 100), 0);
  const costCents = delivered.reduce((sum, o) => sum + Math.round(o.cost * 100), 0);
  const months = Object.fromEntries(['03', '04', '05', '06', '07', '08'].map(m => [`2026-${m}`, 0]));
  for (const o of delivered) months[o.date.slice(0, 7)] += Math.round(o.revenue * 100);
  return {
    revenue: revenueCents / 100,
    margin: revenueCents ? (revenueCents - costCents) / revenueCents * 100 : null,
    fulfilment: delivered.length ? delivered.reduce((s, o) => s + (Date.parse(o.deliveredDate!) - Date.parse(o.date)) / DAY, 0) / delivered.length : null,
    onTime: delivered.length ? delivered.filter(o => o.deliveredDate! <= o.promisedDate).length / delivered.length * 100 : null,
    open: orders.filter(o => o.status === 'Processing' || o.status === 'In Transit').length,
    chartData: Object.entries(months).map(([day, cents]) => ({ day, revenue: cents / 100 })),
    barData: ['Electronics', 'Office', 'Apparel', 'Industrial'].map(name => ({ name, orders: orders.filter(o => o.category === name).length })),
  };
}
