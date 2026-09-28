# Yelson Ops Dashboard

A Next.js and TypeScript portfolio demo showing how an operations team can explore orders, revenue, margins, and fulfilment from a single dashboard.

> **Demo using synthetic data.** All customers, orders, charts, and metrics are fictional. This project is not connected to a production system.

## Live Demo

[Explore Yelson Ops on Vercel](https://yelson-ops-dashboard-demo.vercel.app)

## What It Demonstrates

The overview brings operational signals together to support questions such as which orders are in transit, how order volumes vary by category, and how revenue changes across March–August 2026.

- KPI cards for revenue, order volume, gross margin, and average fulfilment time.
- Revenue line chart and order-category bar chart with tooltips.
- A 1,000-order synthetic table with customer/order-ID search and column sorting.
- CSV export of the currently filtered and sorted orders.
- Responsive layout with a horizontally scrollable order table on small screens.

## Data and Demo Limitations

The `/api/orders` endpoint returns 1,000 deterministic synthetic orders, generated with seed `20260831`. The snapshot covers 1 March–31 August 2026, with statuses as of 31 August. All amounts are EUR, excluding tax and shipping. Reloading does not change the data.

Search selects a common order cohort for all cards, charts, the table, and CSV export. The revenue chart groups delivered order value by **order month**, not delivery month. Category counts include all statuses, including cancelled orders.

### Metric definitions

- Revenue: sum of delivered order values.
- Gross margin: (delivered revenue − delivered cost) / delivered revenue × 100; not an average of row percentages.
- Average fulfilment: mean calendar days between order and actual delivery for delivered orders.
- On-time delivery: delivered orders arriving on or before the promised date / delivered orders × 100.
- Open orders: processing plus in-transit orders as of the snapshot date.
- Order count: all matching records, including cancelled orders.

Undefined rates display a dash. Table values and margins represent individual order values, including open/cancelled orders; they are not all recognized revenue. CSV export also includes cost and promised/actual delivery dates for auditing.

This generator is illustrative, not a model of real commercial performance. There is no database, authentication, live feed, or date filter. Overview is the implemented view; other sidebar entries remain disabled placeholders. Loading, failure/retry, and empty results are handled in the dashboard.

## Tech Stack

- Next.js App Router, React, and TypeScript
- Tailwind CSS for styling
- Recharts for charts
- Lucide React for icons
- Vercel for the hosted demo

## Running Locally

Use Node.js 20.9 or later and npm.

```bash
git clone https://github.com/sayem-araf/yelson-ops-dashboard-demo.git
cd yelson-ops-dashboard-demo
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. No environment variables or external data credentials are required for this demo.

## Project Structure

- `app/page.tsx` — dashboard, API loading, search, sorting, and CSV export.
- `lib/orders.ts` — seeded generation and shared metric calculations.
- `app/api/orders/route.ts` — synthetic orders API.
- `tests/orders.test.mjs` — reproducibility, date integrity, and calculation checks.
- `app/layout.tsx` — shared layout, fonts, and page metadata.
- `app/globals.css` — global styles.
- `public/` — static assets.

## Checks and Production Build

```bash
npm run lint
npm test
npm run build
npm start
```

`npm start` serves the production build after `npm run build` succeeds.

## Possible Extensions

- Add date filtering and historical drill-downs.
- Add a persistent database when the workflow needs it.
- Implement the remaining navigation views and authentication.

## Author

Sayem Araf — Data & Operations Analytics | Python | SQL | Automation | Dashboard Development
