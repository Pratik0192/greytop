"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

type RangeType = "today" | "week" | "month" | "year";

interface DashboardCards {
  totalClients: number;
  activeClients: number;
  totalBet: string;
  totalWin: string;
  totalProfit: string;
  totalLoss: string;
}

interface LineChartData {
  date: string;
  bet: string;
  win: string;
  profit: string;
}

interface ProviderChartData {
  provider: string;
  revenue: string;
}

interface MonthlyChartData {
  label: string;
  profit: string;
}

interface LimitBreached {
  id: string;
  name: string;
  totalBill: string;
  limit: string;
}

interface TopClient {
  userId: string;
  _sum: {
    bill: string;
  };
}

interface DashboardResponse {
  cards: DashboardCards;
  lineChart: LineChartData[];
  providerChart: ProviderChartData[];
  monthlyChart: MonthlyChartData[];
  limitBreached: LimitBreached[];
  topClients: TopClient[];
}

export default function AdminDashboard() {
  const [range, setRange] = useState<RangeType>("today");
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/dashboard?range=${range}`);
      setData(res.data);
    } catch (error) {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [range]);

  if (loading || !data) {
    return (
      <div className="p-6">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const {
    cards,
    lineChart,
    providerChart,
    monthlyChart,
    limitBreached,
    topClients,
  } = data;

  return (
    <div className="p-6 md:mt-12 bg-background text-foreground space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value as RangeType)}
          className="border px-3 py-2 rounded"
        >
          <option value="today">Today</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p>Total Clients</p>
          <h2 className="text-xl font-bold">{cards.totalClients}</h2>
        </Card>

        <Card className="p-4">
          <p>Active Clients</p>
          <h2 className="text-xl font-bold">{cards.activeClients}</h2>
        </Card>

        <Card className="p-4">
          <p>Total Bet</p>
          <h2 className="text-xl font-bold">
            ₹ {Number(cards.totalBet).toFixed(2)}
          </h2>
        </Card>

        <Card className="p-4">
          <p>Total Win</p>
          <h2 className="text-xl font-bold">
            ₹ {Number(cards.totalWin).toFixed(2)}
          </h2>
        </Card>

        <Card className="p-4">
          <p>Total Profit</p>
          <h2 className="text-xl font-bold text-green-600">
            ₹ {Number(cards.totalProfit).toFixed(2)}
          </h2>
        </Card>

        <Card className="p-4">
          <p>Total Loss</p>
          <h2 className="text-xl font-bold text-red-600">
            ₹ {Number(cards.totalLoss).toFixed(2)}
          </h2>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LINE CHART */}
        <Card className="p-6">
          <h2 className="mb-4 font-semibold">Bet / Win / Profit Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="bet" stroke="#facc15" />
              <Line type="monotone" dataKey="win" stroke="#22c55e" />
              <Line type="monotone" dataKey="profit" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* PROVIDER PIE */}
        <Card className="p-6">
          <h2 className="mb-4 font-semibold">Provider Revenue Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={providerChart}
                dataKey="revenue"
                nameKey="provider"
                outerRadius={100}
              >
                {providerChart.map((_, index) => (
                  <Cell key={index} fill={`hsl(${index * 40}, 70%, 50%)`} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* MONTHLY BAR */}
      <Card className="p-6">
        <h2 className="mb-4 font-semibold">Monthly Profit Comparison</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyChart}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="profit" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LIMIT BREACH */}
        <Card className="p-6">
          <h2 className="mb-4 font-semibold text-red-600">
            Limit Breached Clients
          </h2>
          {limitBreached.length === 0 ? (
            <p>No clients exceeded limits.</p>
          ) : (
            <ul className="space-y-2">
              {limitBreached.map((client) => (
                <li
                  key={client.id}
                  className="flex justify-between border-b pb-2"
                >
                  <span>{client.name}</span>
                  <span>
                    ₹ {Number(client.totalBill).toFixed(2)} / ₹{" "}
                    {Number(client.limit).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* TOP CLIENTS */}
        <Card className="p-6">
          <h2 className="mb-4 font-semibold">Top 5 Clients by Revenue</h2>
          <ul className="space-y-2">
            {topClients.map((client, index) => (
              <li
                key={client.userId}
                className="flex justify-between border-b pb-2"
              >
                <span>
                  #{index + 1} - {client.userId}
                </span>
                <span>₹ {Number(client._sum.bill).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
