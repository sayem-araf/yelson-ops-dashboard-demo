"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
} from 'recharts';
import { 
  LayoutDashboard, ShoppingCart, Package, DollarSign, Settings, 
  ArrowUpRight, ArrowDownRight, Download, Search, ChevronUp, ChevronDown 
} from 'lucide-react';

// --- MOCK DATA ---
const generateMockData = () => {
  const categories = ["Electronics", "Office", "Apparel", "Industrial"];
  const statuses = ["Delivered", "In Transit", "Processing"];
  return Array.from({ length: 40 }, (_, i) => ({
    id: `ORD-${1000 + i}`,
    date: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString().split('T')[0],
    customer: `Company ${String.fromCharCode(65 + (i % 26))} Ltd.`,
    category: categories[i % categories.length],
    items: Math.floor(Math.random() * 50) + 1,
    revenue: Math.floor(Math.random() * 5000) + 100,
    margin: Math.floor(Math.random() * 40) + 10,
    status: statuses[i % statuses.length],
  }));
};

const tableData = generateMockData();
const chartData = Array.from({ length: 30 }, (_, i) => ({ day: i + 1, revenue: 1000 + Math.random() * 2000 }));
const barData = [
  { name: 'Electronics', orders: 400 }, { name: 'Office', orders: 300 },
  { name: 'Apparel', orders: 200 }, { name: 'Industrial', orders: 278 }
];

export default function Dashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Fix Hydration Mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- FILTER & SORT LOGIC ---
  const filteredData = useMemo(() => {
    let filterable = tableData.filter(row => 
      row.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
      row.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig !== null) {
      filterable.sort((a: any, b: any) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filterable;
  }, [searchTerm, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // --- EXPORT LOGIC ---
  const exportCSV = () => {
    const headers = ["Order ID", "Date", "Customer", "Category", "Items", "Revenue", "Margin %", "Status"];
    const csvContent = [
      headers.join(","),
      ...filteredData.map(row => 
        [row.id, row.date, `"${row.customer}"`, row.category, row.items, row.revenue, row.margin, row.status].join(",")
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
  };

  // Prevents rendering until the client is ready
  if (!isMounted) return <div className="h-screen bg-[#0B0F17]"></div>;

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
            <button key={item.name} className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-md transition-colors ${item.active ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
              <item.icon size={18} />
              {item.name}
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* TOP BAR */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-b border-slate-800 gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Operations Overview</h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 text-xs font-medium bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 rounded-full">
              Demo, sample data
            </span>
            <span className="text-sm text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-md border border-slate-700">
              Last 30 Days
            </span>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Revenue (30d)', value: '€142,300', change: '+12.5%', isUp: true },
              { label: 'Orders (30d)', value: '842', change: '+5.2%', isUp: true },
              { label: 'Gross Margin %', value: '32.4%', change: '-1.1%', isUp: false },
              { label: 'Avg Fulfilment', value: '1.2 Days', change: '-8.0%', isUp: true },
            ].map((kpi, i) => (
              <div key={i} className="p-5 rounded-lg border border-slate-800 bg-[#0F1523] shadow-sm flex flex-col gap-2">
                <span className="text-sm text-slate-400 font-medium">{kpi.label}</span>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-semibold">{kpi.value}</span>
                  <span className={`text-xs font-medium flex items-center ${kpi.isUp ? 'text-[#10B981]' : 'text-red-400'}`}>
                    {kpi.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {kpi.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-80">
            <div className="p-5 rounded-lg border border-slate-800 bg-[#0F1523] flex flex-col gap-4">
              <h3 className="text-sm font-medium text-slate-300">Daily Revenue</h3>
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
            
            <div className="p-5 rounded-lg border border-slate-800 bg-[#0F1523] flex flex-col gap-4">
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
                    {['id', 'date', 'customer', 'category', 'items', 'revenue', 'margin', 'status'].map((key) => (
                      <th key={key} onClick={() => requestSort(key)} className="px-6 py-3 cursor-pointer hover:text-white transition-colors select-none">
                        <div className="flex items-center gap-1">
                          {key.charAt(0).toUpperCase() + key.slice(1).replace('id', 'ID').replace('margin', 'Margin %')}
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
