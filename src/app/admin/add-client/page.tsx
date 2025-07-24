"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";

export default function AddClient() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ipInput, setIpInput] = useState("");
  const [whitelistedIps, setWhitelistedIps] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleAddIp = () => {
    const trimmed = ipInput.trim();
    if (trimmed && !whitelistedIps.includes(trimmed)) {
      setWhitelistedIps([...whitelistedIps, trimmed]);
      setIpInput("");
    }
  };

  const handleRemoveIp = (ip: string) => {
    setWhitelistedIps(whitelistedIps.filter(item => item !== ip));
  };

  const handleAddClient = async() => {
    if( !name || !email || !password ) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/admin/add-client", {
        name,
        email,
        password,
        whitelistedIps
      });

      toast.success("Client added successfully");
      router.push("/admin/clients")
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to add client");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-6">Add New Client</h1>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Add Client Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="ip">Whitelisted IPs</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="ip"
                placeholder="Enter IP address"
                value={ipInput}
                onChange={(e) => setIpInput(e.target.value)}
                className="flex-1"
              />
              <Button type="button" onClick={handleAddIp}>Add</Button>
            </div>

            {whitelistedIps.length > 0 && (
              <div className="mt-3 space-y-1">
                {whitelistedIps.map((ip, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-1 border rounded text-sm bg-gray-50"
                  >
                    <span>{ip}</span>
                    <button type="button" onClick={() => handleRemoveIp(ip)}>
                      <X className="w-4 h-4 text-red-500 hover:text-red-700" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button onClick={handleAddClient} disabled={loading} className="w-full">
            {loading ? "Adding..." : "Add Client"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}