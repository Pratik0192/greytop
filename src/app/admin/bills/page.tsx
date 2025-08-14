"use client";

import BillProvidersDialog from "@/components/BillProviderDialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import api from "@/lib/axios"
import { useEffect, useMemo, useState } from "react";

interface Provider {
  id: number;
  providerCode: string;
  profit: string;
  loss: string;
}

interface Bill {
  id: number;
  month: number;
  year: number;
  totalProfit: string;
  totalLoss: string;
  user: { name: string; email: string };
  providers: Provider[];
}

export default function Bills() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState<string>("all");

  useEffect(() => {
    api
      .post("/api/admin/get-all-bill")
      .then((res) => {
        setBills(res.data.bills || []);
      })
      .catch((err) => {
        console.error("Error fetching bills:", err);
      });
  }, []);

  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      const matchesSearch = bill.user.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesMonth =
        monthFilter === "all" || bill.month.toString() === monthFilter;

      return matchesSearch && matchesMonth;
    });
  }, [bills, search, monthFilter]);

  return (
    <div className="p-4 mt-20">
      <h1 className="text-xl font-semibold mb-4">Monthly Bills</h1>

      <div className="flex items-center gap-4 mb-4">
        <Input
          placeholder="Search by client name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={monthFilter} onValueChange={(val) => setMonthFilter(val)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {Array.from({ length: 12 }, (_, i) => (
              <SelectItem key={i + 1} value={(i + 1).toString()}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Month/Year</TableHead>
            <TableHead>Total Profit</TableHead>
            <TableHead>Total Loss</TableHead>
            <TableHead>Providers</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bills.map((bill) => (
            <>
              <TableRow key={bill.id}>
                <TableCell>{bill.id}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{bill.user.name}</span>
                    <span className="text-sm text-gray-500">
                      {bill.user.email}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {bill.month}/{bill.year}
                </TableCell>
                <TableCell>{bill.totalProfit}</TableCell>
                <TableCell>{bill.totalLoss}</TableCell>
                <TableCell>
                  <BillProvidersDialog 
                    providers={bill.providers}
                    count={bill.providers.length}
                  />
                </TableCell>
              </TableRow>
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}