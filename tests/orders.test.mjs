import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../lib/orders.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { generateOrders, summarize, AS_OF, START } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);

test('dataset is reproducible, unique and historically consistent', () => {
  const orders = generateOrders();
  assert.equal(orders.length, 1000);
  assert.deepEqual(orders, generateOrders());
  assert.equal(new Set(orders.map(o => o.id)).size, 1000);
  assert.equal(new Set(orders.map(o => o.date.slice(0, 7))).size, 6);
  assert.equal(new Set(orders.map(o => o.status)).size, 4);
  for (const o of orders) {
    assert.ok(o.date >= START && o.date <= AS_OF);
    assert.ok(o.promisedDate > o.date);
    assert.ok(o.revenue > o.cost && o.cost > 0);
    if (o.status === 'Delivered') {
      assert.ok(o.deliveredDate >= o.date && o.deliveredDate <= AS_OF);
    } else assert.equal(o.deliveredDate, null);
  }
});

test('metrics use delivered revenue, weighted margin and correct delivery dates', () => {
  const base = { id: 'A', customer: 'Demo', category: 'Office', items: 1, margin: 0, date: '2026-03-01', promisedDate: '2026-03-04', status: 'Delivered' };
  const rows = [
    { ...base, revenue: 100, cost: 60, deliveredDate: '2026-03-03' },
    { ...base, id: 'B', revenue: 300, cost: 240, deliveredDate: '2026-03-05' },
    { ...base, id: 'C', revenue: 900, cost: 800, status: 'Cancelled', deliveredDate: null },
    { ...base, id: 'D', revenue: 700, cost: 600, status: 'Processing', deliveredDate: null },
  ];
  const m = summarize(rows);
  assert.equal(m.revenue, 400);
  assert.equal(m.margin, 25);
  assert.equal(m.fulfilment, 3);
  assert.equal(m.onTime, 50);
  assert.equal(m.open, 1);
  assert.equal(m.chartData.reduce((s, p) => s + p.revenue, 0), m.revenue);
  assert.equal(m.barData.reduce((s, p) => s + p.orders, 0), rows.length);
  assert.equal(summarize([]).margin, null);
  assert.equal(summarize([]).onTime, null);
  assert.equal(summarize([]).fulfilment, null);
});
