"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import api from "@/lib/axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Games() {
  const [name, setName] = useState("");
  const [types, setTypes] = useState("");
  const [gameUid, setGameUid] = useState("");
  const [gameProviderId, setGameProviderId] = useState("");
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [fetchedGames, setFetchedGames] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);

  // Fetch providers on load
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await api.post("/api/admin/get-providers");
        if (res.data.success) {
          setProviders(res.data.providers);
        } else {
          toast.error(res.data.message || "Failed to load providers");
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Something went wrong");
      }
    };
    fetchProviders();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !gameUid.trim() || !types.trim() || !gameProviderId) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/admin/add-game", {
        name,
        gameUid,
        types,
        gameProviderId,
      });

      if (res.data.success) {
        toast.success(`Game "${res.data.game.name}" added!`);
        setName("");
        setGameUid("");
        setTypes("");
        setGameProviderId("");
      } else {
        toast.error(res.data.message || "Failed to add game");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchGames = async () => {
    if (!gameProviderId.trim()) {
      toast.error("Enter Game Provider ID to fetch games");
      return;
    }
    setFetching(true);
    try {
      const res = await api.post("/api/admin/get-games", { gameProviderId });
      if (res.data.success) {
        setFetchedGames(res.data.games);
      } else {
        toast.error(res.data.message || "No games found");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setFetching(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto mt-20">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Add Game</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Game Name</Label>
                <Input
                  id="name"
                  placeholder="Enter game name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="gameUid">Game Uid</Label>
                <Input
                  id="gameUid"
                  placeholder="Enter gameUid"
                  value={gameUid}
                  onChange={(e) => setGameUid(e.target.value)}
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="types">Game Types</Label>
                <Input
                  id="types"
                  placeholder="e.g. Slot, Table, Live"
                  value={types}
                  onChange={(e) => setTypes(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="providerId">Game Provider ID</Label>
                <Input
                  id="providerId"
                  placeholder="Enter provider ID"
                  value={gameProviderId}
                  onChange={(e) => setGameProviderId(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Adding..." : "Add Game"}
            </Button>
          </form>

          {/* Fetch Games Section */}
          <div className="mt-8">
            <div className="flex gap-4">
              <Input
                placeholder="Enter Game Provider ID"
                value={gameProviderId}
                onChange={(e) => setGameProviderId(e.target.value)}
              />
              <Button onClick={handleFetchGames} disabled={fetching}>
                {fetching ? "Fetching..." : "Fetch Games"}
              </Button>
            </div>

            {/* Games Table */}
            {fetchedGames.length > 0 && (
              <Table className="mt-4">
                <TableCaption>Games for provider {gameProviderId}</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>UID</TableHead>
                    <TableHead>Types</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fetchedGames.map((game) => (
                    <TableRow key={game.id}>
                      <TableCell className="font-medium">{game.id}</TableCell>
                      <TableCell>{game.name}</TableCell>
                      <TableCell>{game.gameUid}</TableCell>
                      <TableCell>{game.types}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
