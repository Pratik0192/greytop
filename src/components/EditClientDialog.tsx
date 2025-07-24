"use client";

import api from "@/lib/axios";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

interface EditClientDialogProps {
  client: {
    id: string;
    name: string;
    status: string;
    whitelistedIps: string[];
  };
  onUpdate: () => void;
}

export default function EditClientDialog({ client, onUpdate }: EditClientDialogProps) {
  const [name, setName] = useState(client.name);
  const [status, setStatus] = useState(client.status);
  const [ips, setIps] = useState(client.whitelistedIps.join(", ")); // comma separated for now
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async() => {
    setLoading(true);
    try {
      await api.post("/api/admin/update-client", {
        clientId: client.id,
        name,
        status,
        whitelistedIps: ips.split(",").map((ip) => ip.trim()).filter((ip) => ip),
      })
      toast.success("Client updated");
      onUpdate();
      setOpen(false);
    } catch (error) {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Edit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Status</Label>
            <select
              className="w-full border rounded px-3 py-2"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <Label>Whitelisted IPs</Label>
            <Input
              value={ips}
              onChange={(e) => setIps(e.target.value)}
              placeholder="e.g., 127.0.0.1, 192.168.0.1"
            />
          </div>
          <Button onClick={handleSave} disabled={loading} className="w-full">
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}