"use client";

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
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

interface GameHistory {
  id: number;
  serialNumber: string;
  gameRound: string;
  betAmount: string;
  winAmount: string;
  profit: string;
  loss: string;
  callbackTime: string;
  createdAt: string;
  gameSessionId: number;
  gameUid: string;
  memberAccount: string;
  currencyCode: string;
}

interface Games {
  id: number;
  gameUid: string;
  createdAt: string;
  providerCode: string;
  gameHistory: GameHistory[];
}

export default function AdminClients() {
  return (
    <Suspense fallback={<p>Loading search params...</p>}>
      <AdminClientsContent />
    </Suspense>
  );
}

function AdminClientsContent() {
  const searchParams = useSearchParams();
  const clientMemberId = searchParams.get("clientMemberId");

  const [games, setGames] = useState<Games[]>([]);
  const [memberName, setMemberName] = useState("");

  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientMemberId) return;

    const fetchGameUids = async () => {
      try {
        const memberRes = await api.post("/api/admin/user/get-member-by-id", {
          clientMemberId,
        });
        if (memberRes.data.success && memberRes.data.member) {
          setMemberName(memberRes.data.member.memberAccount);
        } else {
          setMemberName("Unknown Member");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load game uids");
      } finally {
        setLoading(false);
      }
    };

    fetchGameUids();
  }, [clientMemberId]);

  const fetchGameUidsDetails = async () => {
    if (!clientMemberId) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        clientMemberId,
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) params.append("search", search);
      if (date) params.append("date", date);

      const res = await api.get(`/api/admin/user/get-game-uids?${params}`);

      setGames(res.data.gameSessions || []);
      setTotalPages(res.data.pagination.totalPages || 1);
    } catch (error) {
      toast.error("Failed to load game uids");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGameUidsDetails();
  }, [clientMemberId, search, date, page]);

  return (
    <div className="p-4 md:mt-12 mt-8 bg-background">
      <h1 className="text-2xl font-semibold mb-6 text-foreground">
        {loading ? "Loading..." : `Games for Member: ${memberName}`}
      </h1>

      <div className="flex w-full justify-between mb-4">
        <input
          type="text"
          placeholder="Search Game UID / Serial No"
          className="border px-3 py-2 rounded w-1/3 outline-none focus:border-yellow-500"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />

        <input
          type="date"
          className="border px-3 py-2 rounded w-1/3 outline-none focus:border-yellow-500"
          value={date}
          onChange={(e) => {
            setPage(1);
            setDate(e.target.value);
          }}
        />
      </div>

      <Card className="p-4 text-foreground">
        {loading ? (
          <p>Loading games...</p>
        ) : games.length === 0 ? (
          <p>No game uids found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Game Uids</TableHead>
                <TableHead>Provider Code</TableHead>
                <TableHead>Session Created At</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead>Game Round</TableHead>
                <TableHead>Bet Amount</TableHead>
                <TableHead>Win Amount</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>Loss</TableHead>
                <TableHead>Game Ending Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {games.map((game) =>
                game.gameHistory && game.gameHistory.length > 0 ? (
                  game.gameHistory.map((history, index) => (
                    <TableRow key={`${game.id}-${history.serialNumber}`}>
                      {index === 0 && (
                        <>
                          <TableCell rowSpan={game.gameHistory.length}>
                            {game.gameUid}
                          </TableCell>
                          <TableCell rowSpan={game.gameHistory.length}>
                            {game.providerCode}
                          </TableCell>
                          <TableCell rowSpan={game.gameHistory.length}>
                            {new Date(game.createdAt).toLocaleString()}
                          </TableCell>
                        </>
                      )}
                      <TableCell>{history.serialNumber}</TableCell>
                      <TableCell>{history.gameRound}</TableCell>
                      <TableCell>{history.betAmount}</TableCell>
                      <TableCell>{history.winAmount}</TableCell>
                      <TableCell>{history.profit}</TableCell>
                      <TableCell>{history.loss}</TableCell>
                      <TableCell>
                        {new Date(history.callbackTime).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow key={game.id}>
                    <TableCell>{game.gameUid}</TableCell>
                    <TableCell>{game.providerCode}</TableCell>
                    <TableCell>
                      {new Date(game.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell colSpan={5} className="text-center">
                      Game not Ended.
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      <div className="flex justify-between items-center mt-4">
        <Button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Previous
        </Button>

        <span>
          Page {page} of {totalPages}
        </span>

        <Button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
