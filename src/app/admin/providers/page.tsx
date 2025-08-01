"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/lib/axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AddGamesDialog from "@/components/AddGamesDialog";
import { Card } from "@/components/ui/card";

interface Game {
  gameName: string;
  uid: string;
  type: string;
}

interface Platform {
  id: string;
  name: string;
  games: Game[];
}

export default function AdminProviders() {
  const [providers, setProviders] = useState<Platform[]>([]);
  const [newProvider, setNewProvider] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Platform | null>(null);

  const fetchProviders = async () => {
    try {
      const res = await api.get("/api/admin/getgames");
      setProviders(res.data);
    } catch {
      toast.error("Failed to fetch providers");
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleAddProvider = async () => {
    if (!newProvider.trim()) {
      toast.error("Provider name cannot be empty");
      return;
    }

    try {
      await api.post("/api/greytop/addgames", [
        { platform: newProvider.trim(), games: [] },
      ]);
      toast.success("Provider added successfully!");
      setNewProvider("");
      fetchProviders();
    } catch {
      toast.error("Failed to add provider");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 mt-10">
      <h1 className="text-2xl font-bold mb-4 text-foreground">Add Providers</h1>

      {/* Add Provider Input */}
      <div className="flex gap-3 mb-6">
        <Input
          placeholder="Provider Name"
          value={newProvider}
          onChange={(e) => setNewProvider(e.target.value)}
        />
        <Button onClick={handleAddProvider}>+ Add Provider</Button>
      </div>

      {/* Providers Table */}
      <h2 className="text-xl font-semibold mb-3">Providers</h2>
      <Card className="p-4 text-foreground">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Provider Name</TableHead>
            <TableHead>Total Games</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {providers.map((prov) => (
            <TableRow key={prov.id}>
              <TableCell>{prov.name}</TableCell>
              <TableCell>{prov.games.length - 1}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedProvider(prov);
                    setDialogOpen(true);
                  }}
                >
                  + Add Games
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </Card>

      {/* Games Table */}
      <h2 className="text-xl font-semibold my-5">Games</h2>
      <Card className="p-4 text-foreground">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Provider</TableHead>
            <TableHead>Game Name</TableHead>
            <TableHead>UID</TableHead>
            <TableHead>Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {providers.flatMap((prov) =>
            prov.games
              .filter(
                (game) =>
                  game.gameName.trim() !== "" &&
                  game.uid.trim() !== "" &&
                  game.type.trim() !== ""
              )
              .map((game, idx) => (
                <TableRow key={prov.id + idx}>
                  <TableCell>{prov.name}</TableCell>
                  <TableCell>{game.gameName}</TableCell>
                  <TableCell>{game.uid}</TableCell>
                  <TableCell>{game.type}</TableCell>
                </TableRow>
              ))
          )}
        </TableBody>
      </Table>
      </Card>


      {/* Add Games Dialog */}
      {selectedProvider && (
        <AddGamesDialog
          open={dialogOpen}
          setOpen={setDialogOpen}
          provider={selectedProvider}
          onSuccess={fetchProviders}
        />
      )}
    </div>
  );
}
