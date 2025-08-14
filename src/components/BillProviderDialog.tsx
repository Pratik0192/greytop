import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";


interface Provider {
  id: number;
  providerCode: string;
  profit: string;
  loss: string;
}

export default function BillProvidersDialog({
  providers,
  count,
}: {
  providers: Provider[];
  count: number;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View ({count})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Provider Details</DialogTitle>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Provider Code</TableHead>
              <TableHead>Profit</TableHead>
              <TableHead>Loss</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {providers.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.providerCode}</TableCell>
                <TableCell>{p.profit}</TableCell>
                <TableCell>{p.loss}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}