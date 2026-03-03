"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/lib/axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Provider {
  id: string;
  name: string;
  ggrPercent: number;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function Providers() {
  const [name, setName] = useState("");
  const [ggrPercent, setGgrPercent] = useState("");
  const [loading, setLoading] = useState(false);

  const [providers, setProviders] = useState<Provider[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const [loadingProviders, setLoadingProviders] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 5;

  const fetchProviders = async () => {
    setLoadingProviders(true);
    try {
      const res = await api.get(
        `/api/admin/get-providers?search=${search}&page=${page}&limit=${limit}`,
      );
      if (res.data.success) {
        setProviders(res.data.providers);
        setPagination(res.data.pagination);
      } else {
        toast.error(res.data.message || "Failed to fetch providers");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error fetching providers");
    } finally {
      setLoadingProviders(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [search, page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !ggrPercent.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/admin/add-provider", {
        name,
        ggrPercent: parseFloat(ggrPercent),
      });

      if (res.data.success) {
        toast.success(`Provider "${res.data.provider.name}" added!`);
        setName("");
        setGgrPercent("");
      } else {
        toast.error(res.data.message || "Failed to add provider");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto mt-20 space-y-8">
      {/* Add Provider Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Add Game Provider
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
          >
            <div>
              <Label htmlFor="name">Provider Name</Label>
              <Input
                id="name"
                placeholder="Enter provider name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="ggr">GGR Percent</Label>
              <Input
                id="ggr"
                type="number"
                step="0.01"
                placeholder="e.g. 12.5"
                value={ggrPercent}
                onChange={(e) => setGgrPercent(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto"
            >
              {loading ? "Adding..." : "Add Provider"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Providers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Existing Providers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search by provider name..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
          </div>

          {loadingProviders ? (
            <p>Loading providers...</p>
          ) : providers.length === 0 ? (
            <p>No providers found.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>GGR %</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {providers.map((provider) => (
                    <TableRow key={provider.id}>
                      <TableCell>{provider.id}</TableCell>
                      <TableCell>{provider.name}</TableCell>
                      <TableCell>{provider.ggrPercent}</TableCell>
                      <TableCell>
                        {new Date(provider.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {/* Pagination */}
              {pagination && (
                <div className="flex justify-between items-center mt-4">
                  <Button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>

                  <span>
                    Page {pagination.page} of {pagination.totalPages}
                  </span>

                  <Button
                    disabled={page === pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
