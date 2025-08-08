"use client";

import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import api from "@/lib/axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Games {
  id: number;
  gameUid: string;
  createdAt: string;
}

export default function AdminClients() {

  const searchParams = useSearchParams();
  const clientMemberId = searchParams.get("clientMemberId");

  const [games, setGames] = useState<Games[]>([]);
  const [memberName, setMemberName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientMemberId) return;

    const fetchGameUids = async () => {
      try {
        const gamesRes = await api.post("/api/admin/user/get-game-uids", { clientMemberId });
        console.log("clientMemberId sent:", clientMemberId);
        console.log("games API response:", gamesRes.data);
        setGames(gamesRes.data.gameuids || []);

        try {
          const memberRes = await api.post("/api/admin/user/get-member-by-id", { clientMemberId });
          setMemberName(memberRes.data?.member?.memberAccount || "");
        } catch (error) {
          toast.error("Failed to load member info");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load game uids");
      } finally {
        setLoading(false);
      }
    }

    fetchGameUids();
  }, [clientMemberId]);

  return (
    <div className="p-4 md:mt-12 mt-8 bg-background">
      <h1 className="text-2xl font-semibold mb-6 text-foreground">
        Members for Client: {memberName || clientMemberId}
      </h1>

      <Card className="p-4 text-foreground">
        {loading ? (
          <p>Loading games...</p>
        ) : games.length === 0 ? (
          <p>No game uids found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Game Uids</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {games.map((game) => (
                <TableRow key={game.id}>
                  <TableCell>{game.id}</TableCell>
                  <TableCell>{game.gameUid}</TableCell>
                  <TableCell>
                    {new Date(game.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}