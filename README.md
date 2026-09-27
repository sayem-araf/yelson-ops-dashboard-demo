# Yelson Ops Dashboard

A Next.js and TypeScript portfolio demo showing how an operations team can explore orders, revenue, margins, and fulfilment from a single dashboard.

> **Demo using synthetic data.** All customers, orders, charts, and metrics are fictional. This project is not connected to a production system.

## Live Demo

[Explore Yelson Ops on Vercel(https://yelson-ops-dashboard-demo.vercel.app)

## What It Demonstrates

The overview brings operational signals together to support questions such as which orders are in transit, how order volumes vary by category, and how revenue changes across an illustrative 30-day period.

- KPI cards for revenue, order volume, gross margin, and average fulfilment time.
- Revenue line chart and order-category bar chart with tooltips.
- A 40-order sample table with customer/order-ID search and column sorting.
- CSV export of the currently filtered and sorted orders.
- Responsive layout with a horizontally scrollable order table on small screens.

## Data and Demo Limitations

Order records and daily revenue values are randomly generated when the application module loads. KPI cards and category totals are separate fixed examples; they are not calculated from the order table and do not reconcile with it. The daily chart uses day numbers rather than a dated historical series.

Search and sorting apply only to the order table and CSV export. The “Last 30 Days” label is illustrative, not a date filter. Overview is the implemented view; the remaining sidebar entries are placeholders. There is no live telemetry feed, scheduled refresh, backend, database, or authentication.

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

- `app/page.tsx` — dashboard, synthetic data, search, sorting, and CSV export.
- `app/layout.tsx` — shared layout, fonts, and page metadata.
- `app/globals.css` — global styles.
- `public/` — static assets.

## Checks and Production Build

```bash
npm run lint
npm run build
npm start
```

`npm start` serves the production build after `npm run build` succeeds.

## Possible Extensions

- Derive every KPI and chart from one consistent dataset.
- Add date filtering and historical drill-downs.
- Introduce an API and database with documented metric definitions.
- Implement the remaining navigation views and authentication.

## Author

Sayem Araf — Data & Operations Analytics | Python | SQL | Automation | Dashboard Development
