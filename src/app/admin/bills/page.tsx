"use client";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import api from "@/lib/axios"
import { useEffect, useState } from "react";

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
  const [expanded, setExpanded] = useState<number | null>(null);

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

  return (
    <div className="p-4 mt-20">
      <h1 className="text-xl font-semibold mb-4">Monthly Bills</h1>
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setExpanded(expanded === bill.id ? null : bill.id)
                    }
                  >
                    {expanded === bill.id ? "Hide" : "View"} ({bill.providers.length})
                  </Button>
                </TableCell>
              </TableRow>
              {expanded === bill.id && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Table className="bg-background text-foreground rounded-md">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Provider Code</TableHead>
                          <TableHead>Profit</TableHead>
                          <TableHead>Loss</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bill.providers.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell>{p.providerCode}</TableCell>
                            <TableCell>{p.profit}</TableCell>
                            <TableCell>{p.loss}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}