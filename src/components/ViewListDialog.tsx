import { Eye } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";


 export default function ViewListDialog({ title, items }: { title: string; items: string[] }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 mt-2">
          {items.length > 0 ? (
            items.map((item, idx) => (
              <div key={idx} className="text-sm border-b pb-1">{item}</div>
            ))
          ) : (
            <div className="text-muted-foreground text-sm">No items found</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}