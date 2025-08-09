"use client";

import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

  useEffect(() => {
    if (!userId) return;

    const fetchUsers = async () => {
      try {
        const [membersRes, clientRes] = await Promise.all([
          api.post("/api/admin/user/get-members", { userId }),
          api.post("/api/admin/user/get-client-by-id", { userId })
        ]);


        setMembers(membersRes.data.members || []);
        setClientName(clientRes.data?.client?.name || "");
      } catch (error) {
        console.error(error);
        toast.error("Failed to load members");
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [userId]);

  return (
    <div className="p-4 md:mt-12 mt-8 bg-background">
      <h1 className="text-2xl font-semibold mb-6 text-foreground">
        Members for Client: {clientName || userId}
      </h1>

      <Card className="p-4 text-foreground">
        {loading ? (
          <p>Loading members...</p>
        ) : members.length === 0 ? (
          <p>No members found.</p>
        ) : (
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
        )}
      </Card>
    </div>
  )
}