"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/axios";
import { toast } from "sonner";

interface AddGamesDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  provider: { id: string; name: string };
  onSuccess: () => void;
}

export default function AddGamesDialog({ open, setOpen, provider, onSuccess }: AddGamesDialogProps) {
  const [games, setGames] = useState([{ gameName: "", uid: "", type: "" }]);
  const [loading, setLoading] = useState(false);

  const handleAddField = () => {
    setGames([...games, { gameName: "", uid: "", type: "" }]);
  };

  const handleChange = (index: number, field: string, value: string) => {
    const updated = [...games];
    (updated[index] as any)[field] = value;
    setGames(updated);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await api.post("/api/greytop/addgames", [
        { platform: provider.name, games },
      ]);
      toast.success("Games added successfully!");
      setOpen(false);
      onSuccess();
    } catch {
      toast.error("Failed to add games");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Games to {provider.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {games.map((game, idx) => (
            <div key={idx} className="grid grid-cols-3 gap-3">
              <Input
                placeholder="Game Name"
                value={game.gameName}
                onChange={(e) => handleChange(idx, "gameName", e.target.value)}
              />
              <Input
                placeholder="UID"
                value={game.uid}
                onChange={(e) => handleChange(idx, "uid", e.target.value)}
              />
              <Input
                placeholder="Type"
                value={game.type}
                onChange={(e) => handleChange(idx, "type", e.target.value)}
              />
            </div>
          ))}
          <Button variant="outline" onClick={handleAddField}>
            + Add Another Game
          </Button>
          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Games"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
