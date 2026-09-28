"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
} from 'recharts';
import {
  LayoutDashboard, ShoppingCart, Package, DollarSign, Settings,
  Download, Search, ChevronUp, ChevronDown
} from 'lucide-react';

import { AS_OF, summarize, type Order } from '@/lib/orders';

export default function Dashboard() {
  const [tableData, setTableData] = useState<Order[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Order; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/orders', { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error('Request failed'); return response.json(); })
      .then(data => { if (!Array.isArray(data.orders)) throw new Error('Invalid response'); setTableData(data.orders); setState('ready'); })
      .catch(() => { if (!controller.signal.aborted) setState('error'); });
    return () => controller.abort();
  }, [attempt]);

  // --- FILTER & SORT LOGIC ---
  const filteredData = useMemo(() => {
    const filterable = tableData.filter(row =>
      row.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig !== null) {
      filterable.sort((a, b) => {
        if ((a[sortConfig.key] ?? '') < (b[sortConfig.key] ?? '')) return sortConfig.direction === 'asc' ? -1 : 1;
        if ((a[sortConfig.key] ?? '') > (b[sortConfig.key] ?? '')) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filterable;
  }, [searchTerm, sortConfig, tableData]);
  const metrics = useMemo(() => summarize(filteredData), [filteredData]);
  const { chartData, barData } = metrics;

  const requestSort = (key: keyof Order) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // --- EXPORT LOGIC ---
  const exportCSV = () => {
    const headers = ["Order ID", "Date", "Customer", "Category", "Items", "Order value EUR", "Order margin %", "Status", "Cost EUR", "Promised delivery", "Actual delivery"];
    const csvContent = [
      headers.join(","),
      ...filteredData.map(row =>
        [row.id, row.date, `"${row.customer}"`, row.category, row.items, row.revenue, row.margin, row.status, row.cost, row.promisedDate, row.deliveredDate ?? ''].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "operations_export.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Prevents rendering until the client is ready
  if (state !== 'ready') return <main className="min-h-screen bg-[#0B0F17] text-white p-8">
    {state === 'loading' ? <p role="status">Loading synthetic orders…</p> : <div role="alert"><p>Unable to load orders.</p><button className="mt-4 underline" onClick={() => { setState('loading'); setAttempt(n => n + 1); }}>Retry</button></div>}
  </main>;

  return (
    <div className="flex h-screen bg-[#0B0F17] text-white font-sans overflow-hidden">

      {/* SIDEBAR */}
      <aside className="w-64 border-r border-slate-800 bg-[#0B0F17] hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#10B981]"></div>
            Yelson
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {[
            { name: 'Overview', icon: LayoutDashboard, active: true },
            { name: 'Orders', icon: ShoppingCart, active: false },
            { name: 'Inventory', icon: Package, active: false },
            { name: 'Margins', icon: DollarSign, active: false },
            { name: 'Settings', icon: Settings, active: false },
          ].map((item) => (
            <button key={item.name} disabled={!item.active} title={item.active ? "Current overview" : "Demo placeholder — not implemented"} aria-current={item.active ? "page" : undefined} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-md transition-colors ${item.active ? 'bg-slate-800 text-white' : 'text-slate-500 cursor-not-allowed'}`}>
              <item.icon size={18} />
              {item.name}
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="min-w-0 flex-1 flex flex-col overflow-y-auto">

        {/* TOP BAR */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-b border-slate-800 gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Operations Overview</h2>
            <p className="mt-1 text-sm text-slate-400">Synthetic data · March–August 2026. Search updates all metrics. Revenue includes delivered orders only.</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 text-xs font-medium bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 rounded-full">
              Demo · Synthetic data
            </span>
            <span className="text-sm text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-md border border-slate-700">
              Status as of {AS_OF}
            </span>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Delivered revenue', value: `€${metrics.revenue.toLocaleString('en-GB', { maximumFractionDigits: 2 })}` },
              { label: 'Orders (all statuses)', value: filteredData.length.toLocaleString('en-GB') },
              { label: 'Delivered gross margin', value: metrics.margin === null ? '—' : `${metrics.margin.toFixed(1)}%` },
              { label: 'Avg fulfilment', value: metrics.fulfilment === null ? '—' : `${metrics.fulfilment.toFixed(1)} days` },
              { label: 'On-time delivery', value: metrics.onTime === null ? '—' : `${metrics.onTime.toFixed(1)}%` },
              { label: 'Open orders', value: String(metrics.open) },
            ].map((kpi, i) => (
              <div key={i} className="p-5 rounded-lg border border-slate-800 bg-[#0F1523] shadow-sm flex flex-col gap-2">
                <span className="text-sm text-slate-400 font-medium">{kpi.label}</span>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-semibold">{kpi.value}</span>

                </div>
              </div>
            ))}
          </div>

          {/* CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-80 min-w-0 p-5 rounded-lg border border-slate-800 bg-[#0F1523] flex flex-col gap-4">
              <h3 className="text-sm font-medium text-slate-300">Delivered revenue by order month</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="day" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `€${val/1000}k`} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0F1523', borderColor: '#1E293B', color: '#fff' }} itemStyle={{ color: '#10B981' }} />
                  <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="h-80 min-w-0 p-5 rounded-lg border border-slate-800 bg-[#0F1523] flex flex-col gap-4">
              <h3 className="text-sm font-medium text-slate-300">Orders by Category</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0F1523', borderColor: '#1E293B', color: '#fff' }} cursor={{fill: '#1E293B'}} />
                  <Bar dataKey="orders" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* DATA TABLE */}
          <div className="rounded-lg border border-slate-800 bg-[#0F1523] overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search by ID or Customer..."
                  aria-label="Search orders by ID or customer"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#0B0F17] border border-slate-700 text-sm text-white rounded-md pl-9 pr-4 py-2 focus:outline-none focus:border-[#10B981] transition-colors"
                />
              </div>
              <button onClick={exportCSV} className="flex items-center gap-2 bg-[#0B0F17] border border-slate-700 hover:bg-slate-800 text-sm px-4 py-2 rounded-md transition-colors cursor-pointer">
                <Download size={16} />
                Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#0B0F17]/50 text-slate-400 border-b border-slate-800">
                  <tr>
                    {(['id', 'date', 'customer', 'category', 'items', 'revenue', 'margin', 'status'] as const).map((key) => (
                      <th key={key} onClick={() => requestSort(key)} className="px-6 py-3 cursor-pointer hover:text-white transition-colors select-none">
                        <div className="flex items-center gap-1">
                          {key === 'revenue' ? 'Order value (€)' : key === 'margin' ? 'Order margin %' : key === 'id' ? 'ID' : key.charAt(0).toUpperCase() + key.slice(1)}
                          {sortConfig?.key === key ? (
                            sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                          ) : <div className="w-3.5 h-3.5 opacity-0"></div>}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredData.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-200">{row.id}</td>
                      <td className="px-6 py-4 text-slate-400">{row.date}</td>
                      <td className="px-6 py-4 text-slate-200">{row.customer}</td>
                      <td className="px-6 py-4 text-slate-400">{row.category}</td>
                      <td className="px-6 py-4 text-slate-400">{row.items}</td>
                      <td className="px-6 py-4 text-slate-200 font-medium">€{row.revenue.toLocaleString()}</td>
                      <td className="px-6 py-4 text-slate-400">{row.margin}%</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full border ${
                          row.status === 'Delivered' ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20' :
                          row.status === 'In Transit' ? 'bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/20' :
                          'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredData.length === 0 && (
              <div className="p-8 text-center text-slate-500">No matching records found.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
