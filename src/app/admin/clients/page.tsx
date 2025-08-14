"use client";

import EditClientDialog from "@/components/EditClientDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/lib/axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ViewProviderProfitsDialog from "@/components/ViewProviderProfitsDialog";
import ViewListDialog from "@/components/ViewListDialog";

interface ProviderProfit {
  id: number;
  providerCode: string;
  profit: string;
  loss: string;
  bill: string;
  userId: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  apiKey: string;
  status: string;
  whitelistedIps: string[];
  providersAllowed: string[];
  createdAt: string;
  providerProfits: ProviderProfit[];
  totalBill: String;
}

export default function AdminClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [visibleApiKey, setVisibleApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    try {
      const res = await api.post("/api/admin/get-client");
      setClients(res.data.updatedClients);
    } catch (error) {
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  console.log("clients", clients);

  return (
    <div className="p-4 md:mt-12 mt-8 bg-background">
      <h1 className="text-2xl text-foreground font-semibold mb-6">All Clients</h1>

      <Card className="p-4 text-foreground">
        {loading ? (
          <p>Loading clients...</p>
        ) : clients.length === 0 ? (
          <p>No clients found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>API Key</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Allowed Providers</TableHead>
                <TableHead>Whitelisted IPs</TableHead>
                <TableHead>Total Bill</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <Link
                      href={`/admin/clients/members?userId=${client.id}`}
                      className="hover:underline"
                    >
                      {client.name}
                    </Link>
                    <div className="text-sm text-muted-foreground">{client.email}</div>
                  </TableCell>
                  <TableCell className="max-w-[150px]">
                    {visibleApiKey === client.id ? (
                      <>
                        <span className="text-sm break-all">
                          {client.apiKey}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setVisibleApiKey(null)}
                        >
                          Hide
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="truncate block">{client.apiKey}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setVisibleApiKey(client.id)}
                        >
                          Show
                        </Button>
                      </>
                    )}
                  </TableCell>

                  <TableCell>{client.status}</TableCell>
                  <TableCell className="truncate max-w-[150px]">
                    <ViewListDialog title="Allowed Providers" items={client.providersAllowed} />
                  </TableCell>
                  <TableCell className="truncate max-w-[150px]">
                    <ViewListDialog title="Whitelisted IPs" items={client.whitelistedIps} />
                  </TableCell>
                  <TableCell className="truncate max-w-[150px]">
                    {client.totalBill}
                  </TableCell>
                  <TableCell>
                    {new Date(client.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right align-middle">
                    <div className="flex justify-center items-center gap-3">
                      <ViewProviderProfitsDialog profits={client.providerProfits || []} />
                      <EditClientDialog
                        client={{
                          id: client.id,
                          name: client.name,
                          status: client.status,
                          whitelistedIps: client.whitelistedIps,
                        }}
                        onUpdate={fetchClients}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
