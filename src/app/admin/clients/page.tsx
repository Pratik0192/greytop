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

interface Client {
  id: string;
  name: string;
  email: string;
  apiKey: string;
  status: string;
  whitelistedIps: string[];
  createdAt: string;
}

export default function AdminClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [visibleApiKey, setVisibleApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    try {
      const res = await api.post("/api/admin/get-client");
      setClients(res.data.clients);
    } catch (error) {
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

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
                <TableHead>Id</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>API Key</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Whitelisted IPs</TableHead>
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
                      {client.id}
                    </Link>
                  </TableCell>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
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
                    {client.whitelistedIps.join(", ")}
                  </TableCell>
                  <TableCell>
                    {new Date(client.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {/* <Button size="sm" variant="outline">
                      Edit
                    </Button> */}
                    <EditClientDialog
                      client={{
                        id: client.id,
                        name: client.name,
                        status: client.status,
                        whitelistedIps: client.whitelistedIps,
                      }}
                      onUpdate={fetchClients}
                    />
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
