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
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

interface Member {
  id: number;
  userId: string;
  memberAccount: string;
  createdAt: string;
}

export default function MemberAccounts() {
  return (
    <Suspense fallback={<p>Loading search params...</p>}>
      <MemberAccountsContent />
    </Suspense>
  );
}

function MemberAccountsContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const [members, setMembers] = useState<Member[]>([]);
  const [clientName, setClientName] = useState("");
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);

  const fetchMembers = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        userId,
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) params.append("search", search);
      if (date) params.append("date", date);

      const res = await api.get(
        `/api/admin/user/get-members?${params.toString()}`,
      );

      setMembers(res.data.members || []);
      setTotalPages(res.data.pagination.totalPages || 1);
    } catch (error) {
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [userId, search, date, page]);

  useEffect(() => {
    if (!userId) return;

    const fetchUsers = async () => {
      try {
        const [clientRes] = await Promise.all([
          api.post("/api/admin/user/get-client-by-id", { userId }),
        ]);
        setClientName(clientRes.data?.client?.name || "");
      } catch (error) {
        console.error(error);
        toast.error("Failed to load members");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [userId]);

  return (
    <div className="p-4 md:mt-12 mt-8 bg-background">
      <h1 className="text-2xl font-semibold mb-6 text-foreground">
        Members for Client: {clientName || userId}
      </h1>

      <div className="flex justify-between mb-4 w-full">
        <input
          type="text"
          placeholder="Search member account"
          className="border px-3 py-2 rounded w-1/3 outline-none focus:border-yellow-500"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />

        <input
          type="date"
          className="border px-3 py-2 rounded outline-none focus:border-yellow-500"
          value={date}
          onChange={(e) => {
            setPage(1);
            setDate(e.target.value);
          }}
        />
      </div>

      <Card className="p-4 text-foreground">
        {loading ? (
          <p>Loading members...</p>
        ) : members.length === 0 ? (
          <p>No members found.</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Member Account</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <Link
                        href={`/admin/clients/game-uids?clientMemberId=${member.id}`}
                        className="hover:underline"
                      >
                        {member.id}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/clients/game-uids?clientMemberId=${member.id}`}
                        className="hover:underline"
                      >
                        {member.memberAccount}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {new Date(member.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-between items-center mt-4">
              <Button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
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
          </>
        )}
      </Card>
    </div>
  );
}
