"use client";

import { Eye } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface ProviderProfit {
  id: number;
  providerCode: string;
  profit: string;
  loss: string;
  bill: string;
}

interface Props {
  profits: ProviderProfit[];
}

export default function ViewProviderProfitsDialog({ profits }: Props) {
  return (
    <Dialog>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Eye className="h-4 w-4 hover:cursor-pointer" />
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>View provider wise profit and loss</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Provider wise Profits</DialogTitle>
        </DialogHeader>
        {profits.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Provider Code</TableHead>
                <TableHead>Total Profit</TableHead>
                <TableHead>Total Loss</TableHead>
                <TableHead>Bill</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profits.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.id}</TableCell>
                  <TableCell>{p.providerCode}</TableCell>
                  <TableCell>{p.profit}</TableCell>
                  <TableCell>{p.loss}</TableCell>
                  <TableCell>{p.bill}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p>No provider profits available.</p>
        )}
      </DialogContent>
    </Dialog>
  )
}