"use client";

import { useState, useEffect } from "react";
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
import { Card } from "@/components/ui/card";

type Game = {
  gameName: string;
  uid: string;
  type: string;
};

type Platform = {
  name: string;
  games: Game[];
};

type GameField = keyof Game;

export default function AdminProviders() {
  const [platforms, setPlatforms] = useState([
    { platform: "", games: [{ gameName: "", uid: "", type: "" }] },
  ]);

  const [dbPlatforms, setDbPlatforms] = useState<Platform[]>([]);

  // fetch from /api/admin/getgames
  const fetchPlatforms = async () => {
    try {
      const res = await api.get("/api/admin/getgames");
      setDbPlatforms(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch games");
    }
  };

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const handleAddPlatform = () => {
    setPlatforms((prev) => [
      ...prev,
      { platform: "", games: [{ gameName: "", uid: "", type: "" }] },
    ]);
  };

  const handleAddGame = (platformIndex: number) => {
    setPlatforms((prev) => {
      const newPlatforms = [...prev];
      newPlatforms[platformIndex].games.push({
        gameName: "",
        uid: "",
        type: "",
      });
      return newPlatforms;
    });
  };

  const handleChange = (
    platformIndex: number,
    gameIndex: number,
    field: "platform" | GameField,
    value: string
  ) => {
    setPlatforms((prev) => {
      const newPlatforms = [...prev];
      if (field === "platform") {
        newPlatforms[platformIndex].platform = value;
      } else {
        newPlatforms[platformIndex].games[gameIndex][field] = value;
      }
      return newPlatforms;
    });
  };

  const handleSubmit = async () => {
    try {
      const res = await api.post("/api/greytop/addgames", platforms);
      if (res.data.success) {
        toast.success("Games added successfully!");
        setPlatforms([{ platform: "", games: [{ gameName: "", uid: "", type: "" }] }]);
        fetchPlatforms(); // refresh the table
      }
    } catch (error) {
      toast.error("Failed to add games");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 mt-10">
      <h1 className="text-2xl font-bold mb-4 text-foreground">Add Games</h1>

      {/* Form Section */}
      {platforms.map((plat, pIndex) => (
        <div key={pIndex} className="border p-4 mb-6 rounded-lg bg-card shadow">
          <Input
            placeholder="Provider Name"
            value={plat.platform}
            onChange={(e) => handleChange(pIndex, 0, "platform", e.target.value)}
            className="mb-4"
          />

          {plat.games.map((game, gIndex) => (
            <div key={gIndex} className="grid grid-cols-3 gap-4 mb-4">
              <Input
                placeholder="Game Name"
                value={game.gameName}
                onChange={(e) =>
                  handleChange(pIndex, gIndex, "gameName", e.target.value)
                }
              />
              <Input
                placeholder="UID"
                value={game.uid}
                onChange={(e) =>
                  handleChange(pIndex, gIndex, "uid", e.target.value)
                }
              />
              <Input
                placeholder="Type"
                value={game.type}
                onChange={(e) =>
                  handleChange(pIndex, gIndex, "type", e.target.value)
                }
              />
            </div>
          ))}

          <Button variant="outline" onClick={() => handleAddGame(pIndex)}>
            + Add Game
          </Button>
        </div>
      ))}

      <div className="flex gap-3 mb-8">
        <Button onClick={handleAddPlatform}>+ Add Provider</Button>
        <Button onClick={handleSubmit}>Submit</Button>
      </div>

      {/* Table Section */}
      <h2 className="text-xl font-semibold mb-4">Providers & Games</h2>
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
          {dbPlatforms.length > 0 ? (
            dbPlatforms.map((plat, index) =>
              plat.games.length > 0 ? (
                plat.games.map((game, gIndex) => (
                  <TableRow key={`${index}-${gIndex}`}>
                    <TableCell>{plat.name}</TableCell>
                    <TableCell>{game.gameName}</TableCell>
                    <TableCell>{game.uid}</TableCell>
                    <TableCell>{game.type}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow key={index}>
                  <TableCell>{plat.name}</TableCell>
                  <TableCell colSpan={3} className="text-center">
                    No games available
                  </TableCell>
                </TableRow>
              )
            )
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No games found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </Card>
    </div>
  );
}
